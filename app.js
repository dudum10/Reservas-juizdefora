import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://lzbxmrzospioxznnxdjs.supabase.co',
  'sb_publishable_q2D7gXWZup5fbguqx_0VlA_YDzsYsqv'
)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://lzbxmrzospioxznnxdjs.supabase.co',
  'sb_publishable_q2D7gXWZup5fbguqx_0VlA_YDzsYsqv'
)

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault()

  try {
    const nome = document.getElementById("nome").value.trim()
    const email = document.getElementById("email").value.trim()
    const telefone = document.getElementById("telefone").value.trim()
    const entrada = document.getElementById("entrada").value
    const saida = document.getElementById("saida").value
    const pessoas = document.getElementById("pessoas").value

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const telefoneLimpo = telefone.replace(/\s+/g, "")
    const telefoneValido = /^\+?[0-9]{9,15}$/.test(telefoneLimpo)

    if (!emailValido) {
      alert("Introduz um email válido.")
      return
    }

    if (!telefoneValido) {
      alert("Introduz um número de telefone válido.")
      return
    }

    if (saida <= entrada) {
      alert("A data de saída tem de ser posterior à data de entrada.")
      return
    }

    const { data: conflitos, error: conflitoError } = await supabase
      .from('reservas')
      .select('*')
      .lt('entrada', saida)
      .gt('saida', entrada)

    if (conflitoError) {
      console.error("Erro conflitos detalhado:", conflitoError)
      alert("Erro ao verificar disponibilidade: " + conflitoError.message)
      return
    }

    if (conflitos.length >= 8) {
      alert("Sem quartos disponíveis")
      return
    }

    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .insert([{ nome, email, telefone }])
      .select()

    if (clienteError) {
      console.error("Erro cliente detalhado:", clienteError)
      alert("Erro ao criar cliente: " + clienteError.message)
      return
    }

    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .insert([{
        cliente_id: cliente[0].id,
        entrada,
        saida,
        pessoas: Number(pessoas),
        estado: "pendente",
        pagamento: "não pago"
      }])
      .select()

    if (reservaError) {
      console.error("Erro reserva detalhado:", reservaError)
      alert("Erro ao criar reserva: " + reservaError.message)
      return
    }

    alert("Reserva criada com sucesso!")
    document.getElementById("form").reset()
  } catch (err) {
    console.error("Erro geral:", err)
    alert("Erro inesperado")
  }
})