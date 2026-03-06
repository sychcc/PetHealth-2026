"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {Line} from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
// 註冊chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type Pet = {
  id: string
  name: string
  species: string
  birthdate: string
  chip_number: string | null
  target_weight:number|null
  photo_url: string | null
}
// 體重追蹤-實際體重
type WeightRecord={
  id:string
  date:string
  weight:number
  notes:string|null
}

export default function PetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [weightRecords,setWeightRecords]=useState<WeightRecord[]>([])
  const [error, setError] = useState("")
  const [id, setId] = useState<string>("")
  // for ai-summary
  const [summary,setSummary]=useState("")
  const [fullReport,setFullReport]=useState("")
  const [showFull,setShowFull]=useState(false)
  const [loadingAi,setLoadingAi]=useState(false)


  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/pets/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setPet(data)
        }
      })
      //獲取實際體重
    fetch(`/api/pets/${id}/weight`, { credentials: "include" })
      .then((res) => res.json())
      .then((data)=>setWeightRecords(data))
  }, [id])

  async function handleDelete() {
    if (!confirm("確定要刪除這隻寵物嗎？")) return
    const res = await fetch(`/api/pets/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      router.push("/pets")
    }
  }

  if (error) return <p>{error}</p>
  if (!pet) return <p>Loading...</p>

  //ai-summay
  async function handleAiSummary(){
    setLoadingAi(true)
    fetch(`/api/pets/${id}/ai-summary`, { credentials: "include" })
    .then(res=>res.json())
    .then(data=>{
      setSummary(data.summary)
      setFullReport(data.full_report)
      setLoadingAi(false)
    })
  }
   // age & 星座
 const birthday=new Date(pet.birthdate)
 const today=new Date()
 let age=today.getFullYear()-birthday.getFullYear()
 const hasBirthdayPassed=
 today.getMonth() > birthday.getMonth()||(today.getMonth() === birthday.getMonth() && today.getDate() >= birthday.getDate())
 if(!hasBirthdayPassed){
  age-=1
 }

 function getZodiac(){
  const month=birthday.getMonth()+1
  const date=birthday.getDate()
  if ((month === 3 && date >= 21) || (month === 4 && date <= 19)) return "♈ 牡羊座"
  if ((month === 4 && date >= 20) || (month === 5 && date <= 20)) return "♉ 金牛座"
  if ((month === 5 && date >= 21) || (month === 6 && date <= 20)) return "♊ 雙子座"
  if ((month === 6 && date >= 21) || (month === 7 && date <= 22)) return "♋ 巨蟹座"
  if ((month === 7 && date >= 23) || (month === 8 && date <= 22)) return "♌ 獅子座"
  if ((month === 8 && date >= 23) || (month === 9 && date <= 22)) return "♍ 處女座"
  if ((month === 9 && date >= 23) || (month === 10 && date <= 22)) return "♎ 天秤座"
  if ((month === 10 && date >= 23) || (month === 11 && date <= 21)) return "♏ 天蠍座"
  if ((month === 11 && date >= 22) || (month === 12 && date <= 21)) return "♐ 射手座"
  if ((month === 12 && date >= 22) || (month === 1 && date <= 19)) return "♑ 摩羯座"
  if ((month === 1 && date >= 20) || (month === 2 && date <= 18)) return "♒ 水瓶座"
  return "♓ 雙魚座"

 }

  return (
    <>
  <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
    <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>{pet.name}</h1>
    {pet.photo_url && (
      <img src={pet.photo_url} alt={pet.name} style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }} />
    )}
    <p>Species: {pet.species}</p>
    <p>Birthday: {new Date(pet.birthdate).toLocaleDateString()} 我是 {getZodiac()}</p>
    {pet.chip_number && <p>Chip Number: {pet.chip_number}</p>}
    {pet.target_weight &&<p>Target Weight: {pet.target_weight} kgs</p> }
    <p>Age: {age} years old</p>
    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
  <Link href={`/pets/${id}/vaccines`} style={{ background: "#4b5563", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>Vaccine Records</Link>
  <Link href={`/pets/${id}/weight`} style={{ background: "#4b5563", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>Weight Records</Link>
  <Link href={`/pets/${id}/medical`} style={{ background: "#4b5563", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>Medical Records</Link>
  <Link href={`/pets/${id}/edit`} style={{ background: "#6b7280", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>Edit</Link>
  <button onClick={handleDelete} style={{ background: "#374151", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer" }}>Delete</button>
  <Link href="/pets" style={{ background: "#1f2937", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none" }}>Back</Link>
</div>
  </div>
  {/*dahboard */}
  {/*ai 分析：分析按鈕+展開報告按鈕/ 如果疫苗、體重、醫療紀錄都沒有，就顯示：目前還沒有資料，先去新增寵物的紀錄吧！ */}
  <button onClick={handleAiSummary}>取得AI 健康分析</button>
  {summary &&(
    <div>
      <h2>ai健康摘要</h2>
      <p>{summary}</p>
      <button onClick={()=>setShowFull(!showFull)}>
        {showFull?"收起報告":"查看完整報告"}
      </button>
      {showFull&&<p>{fullReport}</p>}
    </div>
  )}
  
  {/*體重趨勢圖 */}
  {weightRecords.length>0 &&(
    <div>
      <h2>體重趨勢</h2>
      <Line
        data={{
          labels:weightRecords.map((w)=>w.date.split("T")[0]),
          datasets:[{
            label:"實際體重(kg)",
            data:weightRecords.map((w)=>w.weight),
            borderColor:"rgb(75, 192, 192)",
            tension:0.1
          },
          {
            label:"目標體重(kg)",
            data:weightRecords.map(()=>pet.target_weight),
            borderColor:"	#FF2D2D",
            tension:0.1
          }
          
        ]
        }}
        options={{
          plugins:{
            tooltip:{
              callbacks:{
                afterBody:(context)=>{
                  //只出現在第一條線
                  if(context[0].datasetIndex !==0) return ""
                  const actualWeight=context[0].parsed.y
                  const targetWeight=pet.target_weight
                  if(!targetWeight)return ""
                  const diff=parseFloat((actualWeight!-targetWeight).toFixed(1))
                  return diff>0
                    ?`和目標體重相差 +${diff} kg(超重)`
                    :diff<0
                    ?`和目標體重相差 ${diff} kg(未達目標)`
                    :`達成目標體重！`
                }
              }
            }
          }
        }}
      />
    </div>
  )}
  
  </>
  
)
}