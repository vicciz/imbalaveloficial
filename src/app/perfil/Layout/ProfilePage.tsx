"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/supabaseClient"
import { criarEndereco, editarEndereco, buscarEnderecoPrincipalUsuario, atualizarUsuario } from "@/src/services/usuario"

import { BackButton } from "@/src/navigation"

import AddressCard, { type AddressFormValues } from "../components/cards/AddressCard"
import PersonalInfoCard from "../components/cards/PersonalInfoCard"
import ProfileHeader from "./ProfileHeader"
import ProfileSidebar from "./ProfileSidebar"
import SecurityCard from "./SecurityCard"
import type { PerfilUserLike } from "../utils/profile-utils"
import { getRoleLabel } from "../utils/profile-utils"
import { useRouter } from "next/navigation"

const EMPTY_ADDRESS: AddressFormValues = {
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  pais: "Brasil",
  principal: true,
}

interface ProfilePageProps {
  user: PerfilUserLike
  onLogout: () => void
}

function SectionCard({
  children,
  id,
}: {
  children: React.ReactNode
  id: string
}) {
  return (
    <section id={id} className="scroll-mt-28">
      {children}
    </section>
  )
}

export default function ProfilePage({ user, onLogout }: ProfilePageProps) {
  const [activeId, setActiveId] = useState("personal-info")
  const [profileUser, setProfileUser] = useState(user)
  const [profileEmail, setProfileEmail] = useState(user.email ?? "")
  const [address, setAddress] = useState<AddressFormValues>(EMPTY_ADDRESS)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const router = useRouter()
  const isAdmin = profileUser.role === "admin"

  useEffect(() => {
    setProfileUser(user)
    setProfileEmail(user.email ?? "")
  }, [user])

  useEffect(() => {
    let cancelled = false

    async function loadAddress() {
      const { data } = await buscarEnderecoPrincipalUsuario(user.id)

      if (cancelled) {
        return
      }

      if (!data) {
        setAddress(EMPTY_ADDRESS)
        return
      }

      setAddress({
        id: data.id,
        cep: data.cep ?? "",
        logradouro: data.logradouro ?? "",
        numero: data.numero ?? "",
        complemento: data.complemento ?? "",
        bairro: data.bairro ?? "",
        cidade: data.cidade ?? "",
        estado: data.estado ?? "",
        pais: data.pais ?? "Brasil",
        principal: data.principal ?? true,
      })
    }

    loadAddress()

    return () => {
      cancelled = true
    }
  }, [user.id])

  useEffect(() => {
    let cancelled = false

    async function loadAuthEmail() {
      const { data, error } = await supabase.auth.getUser()

      if (cancelled || error) {
        return
      }

      const authEmail = data.user?.email ?? ""

      if (authEmail) {
        setProfileEmail(authEmail)
      }
    }

    if (!profileEmail) {
      loadAuthEmail()
    }

    return () => {
      cancelled = true
    }
  }, [profileEmail])

  const roleText = useMemo(() => getRoleLabel(profileUser.role), [profileUser.role])

  function syncProfileUser(nextUser: PerfilUserLike, nextAddress?: AddressFormValues) {
    const enderecoResumo = nextAddress
      ? [nextAddress.logradouro, nextAddress.numero, nextAddress.cidade, nextAddress.estado]
          .filter(Boolean)
          .join(", ")
      : profileUser.endereco

    setProfileUser({
      ...profileUser,
      ...nextUser,
      email: profileEmail || nextUser.email || profileUser.email,
      endereco: enderecoResumo,
    })
  }

  async function handleSavePersonalInfo(values: { nome: string; telefone: string }) {
    setLoadingProfile(true)

    try {
      const { data, error } = await atualizarUsuario(profileUser.id, {
        nome: values.nome,
        telefone: values.telefone || undefined,
      })

      if (error) {
        alert(error.message || "Não foi possível atualizar o perfil.")
        return
      }

      if (data) {
        syncProfileUser({
          ...profileUser,
          ...data,
        })
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  async function handleSaveAddress(values: AddressFormValues) {
    setLoadingAddress(true)

    try {
      const payload = {
        cep: values.cep || null,
        logradouro: values.logradouro,
        numero: values.numero || null,
        complemento: values.complemento || null,
        bairro: values.bairro || null,
        cidade: values.cidade,
        estado: values.estado,
        pais: values.pais || "Brasil",
        id_usuario: profileUser.id,
        principal: true,
      }

      const response = values.id
        ? await editarEndereco(values.id, payload)
        : await criarEndereco(payload)

      if (response.error) {
        alert(response.error.message || "Não foi possível salvar o endereço.")
        return
      }

      if (response.data) {
        const nextAddress: AddressFormValues = {
          id: response.data.id,
          cep: response.data.cep ?? "",
          logradouro: response.data.logradouro ?? "",
          numero: response.data.numero ?? "",
          complemento: response.data.complemento ?? "",
          bairro: response.data.bairro ?? "",
          cidade: response.data.cidade ?? "",
          estado: response.data.estado ?? "",
          pais: response.data.pais ?? "Brasil",
          principal: response.data.principal ?? true,
        }

        setAddress(nextAddress)
        syncProfileUser(profileUser, nextAddress)
      }
    } finally {
      setLoadingAddress(false)
    }
  }

function handleSelect(id: string) {
  switch (id) {
    case "orders":
      router.push("/pedidos");
      return;

    case "addresses":
      router.push("/perfil/endereco");
      return;
    case "security":
      router.push("/perfil/seguranca");
      return;

    case "admin":
    router.push("/admin");
    return;
    case "logout":
      onLogout();
      return;

    default:
      break;
  }

  setActiveId(id);

  const element = document.getElementById(id);

  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

const MENU_ITEMS = [
  {
    id: "personal-info",
    label: "Informações pessoais",
    icon: "👤",
  },
  {
    id: "addresses",
    label: "Endereços",
    icon: "📍",
  },
  {
    id: "orders",
    label: "Meus pedidos",
    icon: "📦",
  },
  {
    id: "security",
    label: "Trocar Senha",
    icon: "🔒",
  },

    ...(isAdmin
    ? [
        {
          id: "admin",
          label: "Painel Administrativo",
          icon: "🛠️",
        },
      ]
    : []),

  {
    id: "logout",
    label: "Sair",
    icon: "🚪",
  },
];


  return (
    <div className="min-h-screen bg-[#F8F8FC] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <BackButton label="Minha conta" destination="/pedidos" />

          <div className="rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
            {roleText}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <ProfileSidebar
            user={{ ...profileUser, email: profileEmail }}
            menuItems={MENU_ITEMS}
            activeId={activeId}
            onSelect={handleSelect}
            onLogout={onLogout}
          />

          <main className="space-y-6">
            <ProfileHeader roleText={roleText} />

            <div className="space-y-6">
              <SectionCard id="personal-info">
                <PersonalInfoCard
                  key={`${profileUser.nome}-${(profileUser as { telefone?: string }).telefone ?? ""}-${profileEmail}`}
                  nome={profileUser.nome}
                  email={profileEmail}
                  telefone={(profileUser as { telefone?: string }).telefone}
                  onSave={handleSavePersonalInfo}
                  loading={loadingProfile}
                />
              </SectionCard>

              <SectionCard id="addresses">
                <AddressCard
                  key={`${address.id ?? "new"}-${address.cep}-${address.logradouro}-${address.numero}-${address.cidade}-${address.estado}`}
                  endereco={address}
                  onSave={handleSaveAddress}
                  loading={loadingAddress}
                />
              </SectionCard>

              <SectionCard id="security">
                <SecurityCard />
              </SectionCard>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}