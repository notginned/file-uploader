import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../generated/prisma/client.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (supabaseUrl === undefined || supabaseKey === undefined) throw new Error("Could not fetch Supabase secrets");

export const db = new PrismaClient();
export const supabase = createClient(supabaseUrl, supabaseKey);
