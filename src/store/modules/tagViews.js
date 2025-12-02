import { defineStore } from 'pinia'

export const useTagViewsStore = defineStore('tagViews', {
  state: () => ({
    visitedViews: [],
    cachedViews: [],
  }),
  actions: {
    addView(view) {
      // 添加当前路由到visitedViews
      this.addVisitedView(view)
      // 添加当前路由到cachedViews
      this.addCachedView(view)
    },
    addVisitedView(tag) {
      if (this.visitedViews.some((item) => item.path === tag.path)) return
      this.visitedViews.push({
        ...tag,
        title: tag.meta.title || 'no-name',
      })
    },
    addCachedView(view) {
      // TODO: 添加当前路由到cachedViews
      if (this.cachedViews.includes(view.name)) return
      if (!view.meta.noCache) {
        this.cachedViews.push(view.name)
      }
    },
    delView(view) {
      return new Promise((resolve) => {
        this.delVisitedView(view)
        this.delCachedView(view)
        // resolve({
        //   visitedViews: [...this.visitedViews],
        //   cachedViews: [...this.cachedViews],
        // })
      })
    },
    delVisitedView(view) {
      return new Promise((resolve) => {
        for (const [i, v] of this.visitedViews.entries()) {
          if (v.path === view.path) {
            this.visitedViews.splice(i, 1)
            break
          }
        }
        // resolve([...this.visitedViews])
      })
    },
    delCachedView(view) {
      return new Promise((resolve) => {
        const index = this.cachedViews.indexOf(view.name)
        index > -1 && this.cachedViews.splice(index, 1)
        resolve([...this.cachedViews])
      })
    },
  },
})
