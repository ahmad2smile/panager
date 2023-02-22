#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

pub mod excel_processor;
pub mod pdf_processor;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn add_pdf_header(header_text: &str, file: &str, dest_name: &str, dest_path: &str) {
    let _ = pdf_processor::add_header(header_text, file, dest_name, dest_path).unwrap();
}

#[tauri::command]
fn read_excel_columns(
    col_index: usize,
    sheet: &str,
    file_name: &str,
    file_path: &str,
) -> Result<Vec<String>, String> {
    let result = excel_processor::read_columns(col_index, sheet, file_name, file_path);

    match result {
        Ok(r) => Ok(r),
        Err(err) => {
            println!("Error processing excel: {err}");

            Err(String::from(
                "Something went wrong while processing file {file_name}",
            ))
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_pdf_header, read_excel_columns])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
