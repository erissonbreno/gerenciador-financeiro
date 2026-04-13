import type { Patient, PatientFormValues, BackendPatient } from '../types/models'

const genderToFrontend: Record<string, string> = {
  MALE: 'masculino',
  FEMALE: 'feminino',
  OTHER: 'outro',
}

const genderToBackend: Record<string, string> = {
  masculino: 'MALE',
  feminino: 'FEMALE',
  outro: 'OTHER',
}

export function fromBackend(bp: BackendPatient): Patient {
  return {
    id: bp.id,
    name: bp.fullName,
    birthdate: bp.birthDate,
    cpf: bp.cpf,
    rg: bp.rg,
    gender: genderToFrontend[bp.gender] ?? bp.gender,
    maritalStatus: bp.maritalStatus,
    phone: bp.phone,
    email: bp.email,
    street: bp.address?.street ?? '',
    number: bp.address?.number ?? '',
    complement: bp.address?.complement ?? '',
    neighborhood: bp.address?.district ?? '',
    city: bp.address?.city ?? '',
    state: bp.address?.state ?? '',
    zip: bp.address?.zipCode ?? '',
    healthPlan: bp.healthPlan,
    createdAt: bp.createdAt,
  }
}

export function toBackend(fv: PatientFormValues): object {
  return {
    fullName: fv.name,
    birthDate: fv.birthdate,
    cpf: fv.cpf,
    rg: fv.rg,
    gender: genderToBackend[fv.gender] ?? fv.gender,
    maritalStatus: fv.maritalStatus,
    phone: fv.phone,
    email: fv.email,
    address: {
      street: fv.street,
      number: fv.number,
      complement: fv.complement,
      district: fv.neighborhood,
      city: fv.city,
      state: fv.state,
      zipCode: fv.zip,
    },
    healthPlan: fv.healthPlan,
  }
}
