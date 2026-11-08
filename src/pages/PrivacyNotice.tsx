/**
 * S11 Privacy Notice (PRD 12.4)
 * Six sections from the PRD. The exact country sentence is added in Phase 10.
 */
import { useNavigate } from 'react-router-dom'
import { Header } from '../components/Header'

const SECTIONS = [
  {
    heading: 'What we collect',
    body: 'We collect your name, email address, and payment history that your gym Admin records. If you sign up as a Member, we also store the date your membership is paid until.',
  },
  {
    heading: 'Why',
    body: 'We use this information to calculate your membership Status, show your payment history, and let your Admin manage the gym. We do not sell or share your information with any third party.',
  },
  {
    heading: 'Who can see it',
    body: 'Your Admin can see your name, email, phone, Plan, Status and payment history. Only you can see your own login and profile. No other Member can see your information.',
  },
  {
    heading: 'Where it is stored',
    body: 'Your data is stored on Supabase, a secure cloud database. The exact server region is listed in Phase 10. Supabase uses industry-standard encryption at rest and in transit.',
  },
  {
    heading: 'How long we keep it',
    body: 'Your data is kept for as long as your account is active. If you delete your account as a Member, your login is removed immediately. Your gym keeps your payment history for its financial records until the Admin deletes it. If you delete your account as an Admin, all gym data is deleted immediately and permanently.',
  },
  {
    heading: 'How to delete it',
    body: 'Go to Settings and tap "Delete account". As a Member, your login and profile are deleted immediately. As an Admin, your account, gym, all Plans, Members and Payments are deleted immediately and permanently. This cannot be undone.',
  },
]

export function PrivacyNotice() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <Header title="Privacy Notice" showBack onBack={() => navigate(-1)} />
      <main className="flex-1 px-4 py-6 max-w-[480px] w-full mx-auto space-y-6">
        {SECTIONS.map(({ heading, body }) => (
          <section key={heading}>
            <h2 className="text-[18px] font-semibold text-[#111827] mb-1">{heading}</h2>
            <p className="text-[16px] text-[#4B5563] leading-relaxed">{body}</p>
          </section>
        ))}
      </main>
    </div>
  )
}

