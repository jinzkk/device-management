import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentWithCurrentUser } from "@/types/equipment";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  let query = supabase.from("equipment_with_current_user").select("*");

  const search = searchParams.get("search");
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,serial_number.ilike.%${search}%`
    );
  }
  const status = searchParams.get("status");
  if (status) {
    query = query.eq("status", status);
  }
  const type = searchParams.get("type");
  if (type) {
    query = query.eq("type_id", type);
  }

  const { data } = await query.order("created_at", { ascending: false });
  const equipment = (data || []) as EquipmentWithCurrentUser[];

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("장비 목록");

  sheet.columns = [
    { header: "번호", key: "index", width: 8 },
    { header: "장비명", key: "name", width: 25 },
    { header: "유형", key: "type_name", width: 12 },
    { header: "시리얼번호", key: "serial_number", width: 22 },
    { header: "모델명", key: "model", width: 20 },
    { header: "제조사", key: "manufacturer", width: 15 },
    { header: "구매일", key: "purchase_date", width: 12 },
    { header: "구매가(원)", key: "purchase_price", width: 15 },
    { header: "상태", key: "status", width: 10 },
    { header: "현재 사용자", key: "current_user_name", width: 15 },
    { header: "부서", key: "current_department", width: 15 },
    { header: "위치", key: "current_location", width: 20 },
  ];

  // 헤더 스타일
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 24;

  // 데이터 행
  equipment.forEach((item, i) => {
    sheet.addRow({
      index: i + 1,
      name: item.name,
      type_name: item.type_name || "",
      serial_number: item.serial_number || "",
      model: item.model || "",
      manufacturer: item.manufacturer || "",
      purchase_date: item.purchase_date || "",
      purchase_price: item.purchase_price || "",
      status: item.status,
      current_user_name: item.current_user_name || "",
      current_department: item.current_department || "",
      current_location: item.current_location || "",
    });
  });

  // 구매가 컬럼 숫자 포맷
  sheet.getColumn("purchase_price").numFmt = "#,##0";

  // 테두리
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    if (rowNumber > 1) {
      row.alignment = { vertical: "middle" };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `equipment_${format(new Date(), "yyyyMMdd")}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
