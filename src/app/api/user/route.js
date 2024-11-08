import { NextResponse } from "next/server";
import supabase from "@/config/supabase-client";
import { hashPassword } from "@/utils/auth";

export async function POST(request) {
  const body = await request.json();
  const { email, password, first_name, last_name, role } = body;

  if (role.toLowerCase() !== "student" && role.toLowerCase() !== "teacher") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);

  const { error, data } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword, first_name, last_name, role }]);

  if (role.toLowerCase() === "student") {
    const { error: studentError } = await supabase
      .from("students")
      .insert([{ first_name, last_name, email, created_at: new Date() }]);
    if (studentError) {
      return NextResponse.json(
        { error: studentError.message },
        { status: 500 }
      );
    }
  }

  if (role.toLowerCase() === "teacher") {
    const { error: teacherError } = await supabase
      .from("teachers")
      .insert([{ first_name, last_name, email, created_at: new Date() }]);
    if (teacherError) {
      return NextResponse.json(
        { error: teacherError.message },
        { status: 500 }
      );
    }
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
