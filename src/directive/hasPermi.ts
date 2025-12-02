import { useUserStore } from '@/store/modules/user'

export default {
  mounted(el: HTMLElement, binding: any) {
    const { value } = binding
    const all_permission = '*:*:*'
    const userStore = useUserStore()
    const permissions = userStore.userInfo.permissions
    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value

      const hasPermission = permissions.some((permission: string) => {
        return (
          permissionFlag.includes(permission) || all_permission === permission
        )
      })

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`需要权限标签，如 v-hasPermi="['sys:user:add']"`)
    }
  },
}
