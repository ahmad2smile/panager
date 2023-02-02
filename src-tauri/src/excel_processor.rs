use std::path;

use calamine::{open_workbook, Reader, Xlsx};

pub fn read_columns(
    col_index: usize,
    sheet: &str,
    file_name: &str,
    file_path: &str,
) -> Result<Vec<String>, String> {
    let file_path = format!("{file_path}/{file_name}");
    let file_path = path::Path::new(&file_path);
    let mut workbook: Xlsx<_> = open_workbook(file_path).expect("Cannot open file");

    // Read whole worksheet data and provide some statistics
    match workbook.worksheet_range(sheet) {
        Some(Ok(range)) => {
            let total_cells = range.get_size().0 * range.get_size().1;
            let non_empty_cells: usize = range.used_cells().count();

            println!(
                "Found {} cells in 'Sheet1', including {} non empty cells",
                total_cells, non_empty_cells
            );

            if range.get_size().1 < col_index {
                return Err("{col_index} is not valid Column number".to_owned());
            }

            return Ok(range
                .rows()
                .map(move |r| {
                    ((*r)[col_index]
                        .get_string()
                        .unwrap_or_else(|| "Didn't work"))
                    .to_owned()
                })
                .collect::<Vec<String>>());
        }
        _ => (),
    }

    Ok(vec![])
}
