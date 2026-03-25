import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  'https://lzbxmrzospioxznnxdjs.supabase.co',
  'sb_publishable_q2D7gXWZup5fbguqx_0VlA_YDzsYsqv'
)

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault()

  try {
    const nome = document.getElementById("nome").value.trim()
    const email = document.getElementById("email").value.trim().toLowerCase()
    const telefone = document.getElementById("telefone").value.trim()
    const entrada = document.getElementById("entrada").value
    const saida = document.getElementById("saida").value
    const pessoas = document.getElementById("pessoas").value

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const telefoneLimpo = telefone.replace(/\s+/g, "")
    const telefoneValido = /^\+?[0-9]{9,15}$/.test(telefoneLimpo)

    if (!nome) {
      alert("Introduz o nome.")
      return
    }

    if (!emailValido) {
      alert("Introduz um email válido.")
      return
    }

    if (!telefoneValido) {
      alert("Introduz um número de telefone válido.")
      return
    }

    if (!entrada || !saida) {
      alert("Seleciona as datas.")
      return
    }

    if (saida <= entrada) {
      alert("A data de saída tem de ser posterior à data de entrada.")
      return
    }

    // Verificar disponibilidade
    const { data: conflitos, error: conflitoError } = await supabase
      .from('reservas')
      .select('id, entrada, saida')
      .lt('entrada', saida)
      .gt('saida', entrada)

    if (conflitoError) {
      console.error("Erro conflitos:", conflitoError)
      alert("Erro ao verificar disponibilidade: " + conflitoError.message)
      return
    }

    if (conflitos.length >= 8) {
      alert("Sem quartos disponíveis para essas datas.")
      return
    }

    // Procurar cliente existente pelo email
    const { data: clientesExistentes, error: clienteBuscaError } = await supabase
      .from('clientes')
      .select('id, nome, email, telefone')
      .eq('email', email)
      .limit(1)

    if (clienteBuscaError) {
      console.error("Erro a procurar cliente:", clienteBuscaError)
      alert("Erro ao procurar cliente: " + clienteBuscaError.message)
      return
    }

    let clienteId = null

    if (clientesExistentes && clientesExistentes.length > 0) {
      clienteId = clientesExistentes[0].id

      // Atualizar nome e telefone do cliente existente
      const { error: clienteUpdateError } = await supabase
        .from('clientes')
        .update({
          nome,
          telefone
        })
        .eq('id', clienteId)

      if (clienteUpdateError) {
        console.error("Erro ao atualizar cliente:", clienteUpdateError)
        alert("Erro ao atualizar cliente: " + clienteUpdateError.message)
        return
      }
    } else {
      // Criar cliente novo
      const { data: novoCliente, error: clienteCreateError } = await supabase
        .from('clientes')
        .insert([{
          nome,
          email,
          telefone
        }])
        .select('id')
        .single()

      if (clienteCreateError) {
        console.error("Erro ao criar cliente:", clienteCreateError)
        alert("Erro ao criar cliente: " + clienteCreateError.message)
        return
      }

      clienteId = novoCliente.id
    }

    // Criar reserva
    const { data: reserva, error: reservaError } = await supabase
      .from('reservas')
      .insert([{
        cliente_id: clienteId,
        entrada,
        saida,
        pessoas: Number(pessoas),
        estado: "pendente",
        pagamento: "não pago"
      }])
      .select()

    if (reservaError) {
      console.error("Erro ao criar reserva:", reservaError)
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