import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TWILIO_SID    = Deno.env.get('TWILIO_ACCOUNT_SID')!;
const TWILIO_TOKEN  = Deno.env.get('TWILIO_AUTH_TOKEN')!;
const TWILIO_FROM   = 'whatsapp:+14155238886';

const twimlEmpty = () => new Response(
  '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
  { headers: { 'Content-Type': 'text/xml' } }
);

async function sendWhatsApp(to: string, body: string) {
  const url  = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: TWILIO_FROM, To: to, Body: body }).toString(),
  });
}

async function getSession(sb: any, phone: string) {
  const { data } = await sb
    .from('bot_sessions')
    .select('step, data')
    .eq('phone', phone)
    .single();
  return data || null;
}

async function setSession(sb: any, phone: string, step: string, data: any = {}) {
  await sb.from('bot_sessions').upsert({
    phone, step, data, updated_at: new Date().toISOString()
  });
}

async function clearSession(sb: any, phone: string) {
  await sb.from('bot_sessions').delete().eq('phone', phone);
}

Deno.serve(async (req) => {
  const formData  = await req.formData();
  const from      = formData.get('From') as string;
  const bodyRaw   = (formData.get('Body') as string || '').trim();
  const bodyLower = bodyRaw.toLowerCase();

  const sb      = createClient(SUPABASE_URL, SUPABASE_KEY);
  const session = await getSession(sb, from);
  const step    = session?.step || 'inicio';

  // ── Arrancar con "gasto" o "hola" ─────────────────────────────────────────
  if (step === 'inicio' || bodyLower === 'gasto' || bodyLower === 'hola') {
    const { data: obras } = await sb
      .from('obras')
      .select('id, titulo')
      .eq('estado', 'en_curso')
      .order('titulo');

    if (!obras || obras.length === 0) {
      await sendWhatsApp(from, '⚠️ No hay obras activas en este momento.');
      await clearSession(sb, from);
      return twimlEmpty();
    }

    const lista = obras.map((o: any, i: number) => `${i + 1}. ${o.titulo}`).join('\n');
    await sendWhatsApp(from, `¿En qué obra?\n\n${lista}\n\nRespondé con el número.`);
    await setSession(sb, from, 'elegir_obra', { obras });
    return twimlEmpty();
  }

  // ── Elegir obra ────────────────────────────────────────────────────────────
  if (step === 'elegir_obra') {
    const obras = session.data.obras;
    const idx   = parseInt(bodyLower) - 1;
    if (isNaN(idx) || idx < 0 || idx >= obras.length) {
      await sendWhatsApp(from, '❌ Número inválido. Respondé con el número de la obra.');
      return twimlEmpty();
    }
    const obra = obras[idx];
    await sendWhatsApp(from, `Obra: *${obra.titulo}*\n\n¿Cuánto fue el gasto? (solo el número, ej: 15000)`);
    await setSession(sb, from, 'pedir_monto', { obraId: obra.id, obraTitulo: obra.titulo });
    return twimlEmpty();
  }

  // ── Monto ──────────────────────────────────────────────────────────────────
  if (step === 'pedir_monto') {
    const monto = parseFloat(bodyLower.replace(/\./g, '').replace(',', '.'));
    if (isNaN(monto) || monto <= 0) {
      await sendWhatsApp(from, '❌ Monto inválido. Ingresá solo el número, ej: 15000');
      return twimlEmpty();
    }
    await sendWhatsApp(from, '¿Descripción breve del gasto?');
    await setSession(sb, from, 'pedir_descripcion', { ...session.data, monto });
    return twimlEmpty();
  }

  // ── Descripción y guardar ──────────────────────────────────────────────────
  if (step === 'pedir_descripcion') {
    const { obraId, obraTitulo, monto } = session.data;
    const { error } = await sb.from('transacciones').insert({
      tipo:        'egreso',
      descripcion: bodyRaw,
      monto,
      fecha:       new Date().toISOString().split('T')[0],
      obra_id:     obraId,
      categoria:   'Materiales',
    });

    if (error) {
      await sendWhatsApp(from, '❌ Error al guardar. Mandá *gasto* para intentar de nuevo.');
    } else {
      const montoFmt = new Intl.NumberFormat('es-AR').format(monto);
      await sendWhatsApp(from,
        `✅ Gasto registrado\n\n` +
        `📍 Obra: ${obraTitulo}\n` +
        `💰 Monto: $${montoFmt}\n` +
        `📝 ${bodyRaw}`
      );
    }

    await clearSession(sb, from);
    return twimlEmpty();
  }

  // Fallback
  await sendWhatsApp(from, 'Mandá *gasto* para registrar un gasto.');
  await clearSession(sb, from);
  return twimlEmpty();
});
