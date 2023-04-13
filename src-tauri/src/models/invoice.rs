use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../src/models/Invoice.ts")]
pub struct Invoice {
    pub invoice_number: String,
    pub date: String,
    pub name: String,
    pub company: String,
    pub total: f32,
    pub currency: String,
    pub file: String,
}
