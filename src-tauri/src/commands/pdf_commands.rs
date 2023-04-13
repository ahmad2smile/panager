#[tauri::command]
pub fn pdf_extract_text(path: &str) -> Result<String, String> {
    // NOTE: Lib panics and kills the appz
    std::panic::catch_unwind(|| {
        pdf_extract::extract_text(path)
            .map_err(|err| {
                println!("{err:#?}");
                format!("Extracting text from pdf failed at path: {path}")
            })
            .unwrap()
    })
    .map_err(|err| format!("Error: {err:#?}"))
}
