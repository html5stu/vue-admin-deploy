import { useTagViewsStore } from '@/store/modules/tagViews'

export default {
  // 关闭当前tab
  closePage(obj) {
    const tagViewsStore = useTagViewsStore()
    return tagViewsStore.delView(obj)
  },
}
