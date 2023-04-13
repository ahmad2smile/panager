use chrono::Datelike;
use std::collections::HashMap;
use xlsxwriter::worksheet::DateTime;
use xlsxwriter::{Format, Workbook, Worksheet};

use crate::models::invoice::Invoice;

const FONT_SIZE: f64 = 12.0;

#[tauri::command]
pub fn create_xlsx(values: Vec<Invoice>, path: &str) -> Result<(), String> {
    let workbook = Workbook::new(path).map_err(|_| "Unable to generate new Workbook at path")?;
    let mut sheet = workbook
        .add_worksheet(None)
        .map_err(|_| "Unable to add worksheet to excel workbook")?;

    let mut width_map: HashMap<u16, usize> = HashMap::new();

    create_headers(&mut sheet, &mut width_map);

    let mut binding = Format::new();
    let fmt = binding.set_text_wrap().set_font_size(FONT_SIZE);
    let mut excel_date_fmt = Format::new();
    let excel_date_fmt = excel_date_fmt
        .set_num_format("dd/mm/yyyy")
        .set_font_size(FONT_SIZE);

    for (i, v) in values.iter().enumerate() {
        add_row(i as u32, &v, &mut sheet, &excel_date_fmt, &mut width_map);
    }

    width_map.iter().for_each(|(k, v)| {
        let _ = sheet.set_column(*k as u16, *k as u16, *v as f64 * 1.2, Some(&fmt));
    });

    workbook.close().map_err(|_| "workbook can be closed")?;

    Ok(())
}

fn add_row(
    row: u32,
    thing: &Invoice,
    sheet: &mut Worksheet,
    excel_date_fmt: &Format,
    width_map: &mut HashMap<u16, usize>,
) {
    add_string_column(row, 0, &thing.invoice_number, sheet, width_map);
    add_date_column(row, 1, &thing.date, sheet, width_map, excel_date_fmt);
    add_string_column(row, 2, &thing.name, sheet, width_map);
    add_string_column(row, 3, &thing.company, sheet, width_map);

    let mut fmt = Format::new();
    let currency_fmt = fmt.set_num_format("#.0#").set_font_size(FONT_SIZE);
    add_number_column(row, 4, thing.total, sheet, width_map, Some(&currency_fmt));

    add_string_column(row, 5, &thing.currency, sheet, width_map);
    add_string_column(row, 6, &thing.file, sheet, width_map);

    let _ = sheet.set_row(row, FONT_SIZE, None);
}

fn add_number_column(
    row: u32,
    column: u16,
    data: f32,
    sheet: &mut Worksheet,
    mut width_map: &mut HashMap<u16, usize>,
    format: Option<&Format>,
) {
    let _ = sheet.write_number(row + 1, column, data.into(), format);
    set_new_max_width(column, data.to_string().len(), &mut width_map);
}

fn add_string_column(
    row: u32,
    column: u16,
    data: &str,
    sheet: &mut Worksheet,
    mut width_map: &mut HashMap<u16, usize>,
) {
    let _ = sheet.write_string(row + 1, column, data, None);
    set_new_max_width(column, data.len(), &mut width_map);
}

fn add_date_column(
    row: u32,
    column: u16,
    date: &str,
    sheet: &mut Worksheet,
    mut width_map: &mut HashMap<u16, usize>,
    excel_date_fmt: &Format,
) {
    let date = chrono::NaiveDate::parse_from_str(date, "%Y-%m-%d").unwrap_or_default();

    let date = DateTime::date(date.year() as i16, date.month() as i8, date.day() as i8);

    let _ = sheet.write_datetime(row + 1, column, &date, Some(excel_date_fmt));
    set_new_max_width(column, 15, &mut width_map);
}

fn set_new_max_width(col: u16, new: usize, width_map: &mut HashMap<u16, usize>) {
    match width_map.get(&col) {
        Some(max) => {
            if new > *max {
                width_map.insert(col, new);
            }
        }
        None => {
            width_map.insert(col, new);
        }
    };
}

fn create_headers(sheet: &mut Worksheet, mut width_map: &mut HashMap<u16, usize>) {
    let _ = sheet.write_string(0, 0, "Invoice #", None);
    let _ = sheet.write_string(0, 1, "Date", None);
    let _ = sheet.write_string(0, 2, "Name", None);
    let _ = sheet.write_string(0, 3, "Company", None);
    let _ = sheet.write_string(0, 4, "Total", None);
    let _ = sheet.write_string(0, 5, "Currency", None);
    let _ = sheet.write_string(0, 6, "File", None);

    set_new_max_width(0, "Invoice #".len(), &mut width_map);
    set_new_max_width(1, "Date".len(), &mut width_map);
    set_new_max_width(2, "Name".len() * 2, &mut width_map);
    set_new_max_width(3, "Company".len() * 2, &mut width_map);
    set_new_max_width(4, "Total".len() * 2, &mut width_map);
    set_new_max_width(5, "Currency".len() * 2, &mut width_map);
    set_new_max_width(6, "File".len(), &mut width_map);
}
