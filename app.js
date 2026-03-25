import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://lzbxmrzospioxznnxdjs.supabase.co',
  'sb_publishable_q2D7gXWZup5fbguqx_0VlA_YDzsYsqv'
)

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault()

  try {
    const nome = document.getElementById("nome").value
    const email = document.getElementById("email").value
    const entrada = document.getElementById("entrada").value
    const saida = document.getElementById("saida").value
    const pessoas = document.getElementById("pessoas").value

    console.log("Dados do formulário:", { nome, email, entrada, saida, pessoas })

    const { data: conflitos, error: conflitoError } = await supabase
      .from('reservas')
      .select('*')
      .lt('entrada', saida)
      .gt('saida', entrada)

    console.log("Erro conflitos:", conflitoError)

    if (conflitoError) {
      alert("Erro ao verificar disponibilidade")
      return
    }

    if (conflitos.length >= 8) {
      alert("Sem quartos disponíveis")
      return
    }

    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .insert([{ nome, email }])
      .select()

    console.log("Erro cliente:", clienteError)

    if (clienteError) {
      alert("Erro ao criar cliente")
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

    console.log("Erro reserva:", reservaError)

    if (reservaError) {
      alert("Erro ao criar reserva")
      return
    }

    alert("Reserva criada com sucesso!")
  } catch (err) {
    console.error("Erro geral:", err)
    alert("Erro inesperado")
  }
})