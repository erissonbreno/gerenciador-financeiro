import { db } from './db'

const SEED_KEY = 'mock_seeded'

function alreadySeeded(): boolean {
  return localStorage.getItem(SEED_KEY) === 'true'
}

function markSeeded() {
  localStorage.setItem(SEED_KEY, 'true')
}

export async function seedMockData() {
  if (alreadySeeded()) return

  // Buscar pacientes reais do backend (via proxy do Vite)
  let patientIds: string[] = []
  try {
    const res = await fetch('/api/v1/patients?limit=50')
    if (res.ok) {
      const json = await res.json()
      const patients = json.data ?? json
      patientIds = patients.map((p: { id: string }) => p.id)
    }
  } catch {
    // Backend indisponível — seed sem pacientes vinculados
  }

  // Helpers para distribuir pacientes nos pagamentos
  const pid = (index: number) => patientIds[index % patientIds.length] ?? ''

  // --- Pagamentos Particulares ---

  db.payments.create({
    patientId: pid(0),
    description: 'Avaliação fonoaudiológica',
    value: 250,
    serviceDate: '2026-04-01',
    paymentType: 'particular',
    status: 'pago',
    category: 'Consulta',
    paymentMethod: 'especie',
  })

  db.payments.create({
    patientId: pid(0),
    description: 'Sessão de fonoterapia',
    value: 180,
    serviceDate: '2026-04-08',
    paymentType: 'particular',
    status: 'pago',
    category: 'Procedimento',
    paymentMethod: 'debito',
  })

  db.payments.create({
    patientId: pid(1),
    description: 'Exame audiométrico',
    value: 320,
    serviceDate: '2026-04-12',
    paymentType: 'particular',
    status: 'pendente',
    category: 'Exame',
    paymentMethod: 'credito',
    creditMode: 'avista',
  })

  db.payments.create({
    patientId: pid(2),
    description: 'Tratamento completo disfagia',
    value: 900,
    serviceDate: '2026-03-20',
    paymentType: 'particular',
    status: 'pendente',
    category: 'Procedimento',
    paymentMethod: 'credito',
    creditMode: 'parcelado',
    installments: 3,
  })

  // --- Pagamentos Convênio ---

  // Pendente há 100+ dias (critical)
  db.payments.create({
    patientId: pid(0),
    description: 'Sessão fonoterapia - Jan',
    value: 200,
    serviceDate: '2026-01-05',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Consulta',
    convenioType: 'Unimed',
  })

  // Pendente há 70+ dias (danger)
  db.payments.create({
    patientId: pid(0),
    description: 'Sessão fonoterapia - Fev',
    value: 200,
    serviceDate: '2026-02-03',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Consulta',
    convenioType: 'Unimed',
  })

  // Pendente há 40+ dias (warning)
  db.payments.create({
    patientId: pid(0),
    description: 'Sessão fonoterapia - Mar',
    value: 200,
    serviceDate: '2026-03-05',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Consulta',
    convenioType: 'Unimed',
  })

  // Bradesco - Pendente recente
  db.payments.create({
    patientId: pid(1),
    description: 'Avaliação vocal',
    value: 350,
    serviceDate: '2026-04-02',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Exame',
    convenioType: 'Bradesco Saúde',
  })

  db.payments.create({
    patientId: pid(1),
    description: 'Sessão terapia vocal',
    value: 180,
    serviceDate: '2026-04-09',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Procedimento',
    convenioType: 'Bradesco Saúde',
  })

  // Amil - Pendente
  db.payments.create({
    patientId: pid(2),
    description: 'Exame de deglutição',
    value: 280,
    serviceDate: '2026-03-25',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Exame',
    convenioType: 'Amil',
  })

  // SulAmérica - Pendente
  db.payments.create({
    patientId: pid(3),
    description: 'Sessão de reabilitação auditiva',
    value: 220,
    serviceDate: '2026-04-05',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Procedimento',
    convenioType: 'SulAmérica',
  })

  // SulAmérica - Recebido com glosa
  const sulamericaPago = db.payments.create({
    patientId: pid(3),
    description: 'Avaliação audiológica',
    value: 300,
    serviceDate: '2026-02-15',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Exame',
    convenioType: 'SulAmérica',
  })
  db.payments.receive(sulamericaPago[0].id, {
    receivedDate: '2026-03-20',
    receivedValue: 270,
  })

  // Unimed - Recebido sem glosa
  const unimedPago = db.payments.create({
    patientId: pid(0),
    description: 'Exame audiométrico - Dez',
    value: 250,
    serviceDate: '2025-12-10',
    paymentType: 'convenio',
    status: 'pendente',
    category: 'Exame',
    convenioType: 'Unimed',
  })
  db.payments.receive(unimedPago[0].id, {
    receivedDate: '2026-01-15',
    receivedValue: 250,
  })

  markSeeded()
}
