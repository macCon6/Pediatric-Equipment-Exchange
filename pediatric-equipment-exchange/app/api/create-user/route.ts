import {createClient} from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! //server only
);

export async function POST(req: Request) {
    const {username, password } = await req.json();
    const cleanUsername = username.toLowerCase().trim();
    const email = '${username}@PAEC.com';
    const {data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadate: {
            username,
        },
    });
    if (!username || !password) {
        return new Response(JSON.stringify({error: "Missing Fields"}), {status:400});
    }
    return new Response(JSON.stringify(data), {status: 200})
}