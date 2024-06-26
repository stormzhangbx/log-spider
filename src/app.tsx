import type { Settings as LayoutSettings, ProLayoutProps } from '@ant-design/pro-components'
import { history } from '@umijs/max'
import type { RequestConfig, RunTimeLayoutConfig, RuntimeConfig } from '@umijs/max'
import { message as Message, Modal, Tooltip } from 'antd'
import defaultSettings from '../config/setting'
import { buildMenus } from './router/helper/menu'
import { buildRoutes } from './router/helper/route'
import { getLoginUserInfo } from '@/apis/auth/login'
import { getUserRouters } from '@/apis/system/menu'
import { PageEnum } from '@/enums/pageEnum'
import { AvatarDropdown, AvatarName } from '@/layouts/default'
import { getToken, removeToken } from '@/utils/auth'

/**
 * @name InitialState 全局初始化数据配置用于 Layout 用户信息和权限初始化
 * @doc https://umijs.org/docs/api/runtime-config#getinitialstate
 */
interface InitialState {
  settings?: Partial<LayoutSettings & { token: ProLayoutProps['token'] }>
  token?: string
  userInfo?: UserInfo
  fetchUserInfo?: () => Promise<UserInfo | undefined>
}
export async function getInitialState(): Promise<InitialState> {
  const token = getToken()
  const location = history.location
  const fetchUserInfo = async () => {
    try {
      const res = await getLoginUserInfo()
      return res
    } catch (error) {
      removeToken()
      history.push(PageEnum.BASE_LOGIN)
      throw error
    }
  }

  if (token && location.pathname !== PageEnum.BASE_LOGIN) {
    const userInfo = await fetchUserInfo()
    return {
      fetchUserInfo,
      userInfo,
      settings: defaultSettings as Partial<LayoutSettings>,
    }
  } else {
    if (location.pathname !== PageEnum.BASE_LOGIN) {
      removeToken()
      history.push(PageEnum.BASE_LOGIN)
    }
  }

  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  }
}

/**
 * @name ProLayout 运行时布局配置
 * @doc https://procomponents.ant.design/components/layout#prolayout
 */
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  const user = initialState?.userInfo

  return {
    avatarProps: {
      // src: user?.avatar,
      icon: <img src="/avatar.png" />,
      style: { backgroundColor: '#d2edf3' },
      title: <AvatarName name={user?.name || ''} />,
      render: (_, children) => {
        return <AvatarDropdown>{children}</AvatarDropdown>
      },
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    // https://procomponents.ant.design/components/layout#从服务器获取
    postMenuData(menuData) {
      return buildMenus(menuData!)
    },
    childrenRender: (children) => {
      return children
    },
    menu: {
      defaultOpenAll: true,
      autoClose: false,
    },
    ...initialState?.settings,
  }
}

/**
 * @name Request 运行时请求配置
 * @doc https://umijs.org/docs/max/request
 */
const status = { isOpen: true }
export const request: RequestConfig = {
  timeout: 1000 * 60,
  requestInterceptors: [
    [
      (config: any) => {
        const token = getToken()
        const isToken = config.isToken === false
        if (token && !isToken) {
          config.headers.token = token
        }
        config.url = `${BASE_URL}${config.url}`
        return config
      },
      (error: any) => {
        return Promise.reject(error)
      },
    ],
  ],
  responseInterceptors: [
    [
      (response: any) => {
        const code = response.data.code || 0
        const message = response.data.msg || '系统未知错误，请反馈给管理员'
        const getResponse = response.config.getResponse
        const skipErrorHandler = response.config.skipErrorHandler

        // 错误判断
        if (skipErrorHandler) {
          if (code !== 0) {
            return Promise.reject(new Error(message))
          }
        } else if (code === 401) {
          if (status.isOpen) {
            status.isOpen = false
            Modal.confirm({
              title: '系统提示',
              content: '登录状态已过期，您可以继续留在该页面，或者重新登录',
              cancelText: '取消',
              okText: '重新登录',
              onOk() {
                status.isOpen = true
                removeToken()
                history.push(PageEnum.BASE_LOGIN)
              },
              onCancel() {
                status.isOpen = true
              },
            })
          }
          return Promise.reject(new Error(message))
        } else if (code !== 0) {
          Message.error(message)
          return Promise.reject(new Error(message))
        }

        return getResponse ? response : response.data
      },
      (error: any) => {
        const skipErrorHandler = error.config.skipErrorHandler
        if (skipErrorHandler) {
          return Promise.reject(error)
        }

        Message.error('系统未知错误，请反馈给管理员')
        return Promise.reject(error)
      },
    ],
  ],
}

let dynamicRoutes: any[] = []
/**
 * @name patchClientRoutes 修改路由表
 * @doc https://umijs.org/docs/api/runtime-config#patchclientroutes-routes-
 */
export const patchClientRoutes: RuntimeConfig['patchClientRoutes'] = async ({ routes }) => {
  // 如果 config/config.ts 中没有 routes 配置，Umi 会进入约定式路由模式，然后分析 src/pages 目录拿到路由配置
  // 因此这里 routes 由解析 src/pages 目录而得到
  buildRoutes(routes, dynamicRoutes)
}

/**
 * @name render 覆写渲染函数
 * @doc https://umijs.org/docs/api/runtime-config#renderoldrender-function
 */
export const render: RuntimeConfig['render'] = (oldRender) => {
  const token = getToken()
  if (token) {
    getUserRouters()
      .then((data) => {
        dynamicRoutes = data
      })
      .catch(() => {
        removeToken()
        history.push(PageEnum.BASE_LOGIN)
      })
      .finally(() => {
        oldRender()
      })
  } else {
    dynamicRoutes = []
    oldRender()
  }
}
