#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

pub mod file_processor;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn add_pdf_header(header_text: &str, name: &str, src_path: &str, dest_path: &str) {
    let _ = file_processor::add_header(header_text, name, src_path, dest_path);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_pdf_header])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
