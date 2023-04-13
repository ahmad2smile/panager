// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use commands::invoice_commands::create_xlsx;
use commands::pdf_commands::pdf_extract_text;

mod commands;
mod models;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![create_xlsx, pdf_extract_text])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
