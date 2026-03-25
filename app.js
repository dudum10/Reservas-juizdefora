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

    console.log("Dados:", { nome, email, telefone, entrada, saida, pessoas })

    // ✅ validações
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const telefoneLimpo = telefone.replace(/\s+/g, "")
    const telefoneValido = /^\+?[0-9]{9,15}$/.test(telefoneLimpo)

    if (!emailValido) {
      alert("Email inválido")
      return
    }

    if (!telefoneValido) {
      alert("Telefone inválido")
      return
    }

    if (saida <= entrada) {
      alert("Data de saída inválida")
      return
    }

    // 🔍 verificar disponibilidade
    const { data: conflitos, error: conflitoError } = await supabase
      .from('reservas')
      .select('*')
      .lt('entrada', saida)
      .gt('saida', entrada)

    if (conflitoError) {
      console.error("Erro conflitos:", conflitoError)
      alert("Erro ao verificar disponibilidade: " + conflitoError.message)
      return
    }

    if (conflitos.length >= 8) {
      alert("Sem quartos disponíveis")
      return
    }

    // 👤 criar cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .insert([{ nome, email, telefone }])
      .select()

    if (clienteError) {
      console.error("Erro cliente:", clienteError)
      alert("Erro ao criar cliente: " + clienteError.message)
      return
    }

    console.log("Cliente criado:", cliente)

    // 🛏️ criar reserva
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
      console.error("Erro reserva:", reservaError)
      alert("Erro ao criar reserva: " + reservaError.message)
      return
    }

    console.log("Reserva criada:", reserva)

    alert("Reserva criada com sucesso!")
    document.getElementById("form").reset()

  } catch (err) {
    console.error("Erro geral:", err)
    alert("Erro inesperado")
  }
})