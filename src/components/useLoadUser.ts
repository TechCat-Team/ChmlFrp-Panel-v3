import axios from 'axios'
import { useUserStore } from '@/stores/user'

export async function useLoadUserInfo() {
  const userStore = useUserStore()
  const userInfo = userStore.userInfo;
  const token = userInfo?.usertoken;
  if (!token) return

  try {
    const res = await axios.get(`https://cf-v2.uapis.cn/userinfo?token=${token}`)
    if (res.data.code === 200) {
      userStore.setUser(res.data.data)
    }
  } catch (err) {
    console.error('加载用户信息失败', err)
  }
}