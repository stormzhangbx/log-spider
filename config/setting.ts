import type { ProLayoutProps } from '@ant-design/pro-components'

/**
 * @name ProLayout 默认设置
 * @doc https://procomponents.ant.design/components/layout#api
 */
const Setting: ProLayoutProps = {
  title: 'LogSpider',
  logo: '/logo.png',
  layout: 'mix',
  navTheme: 'light',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  token: {
    // https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
    bgLayout: '#f2f3f7',
    sider: {
      colorMenuBackground: '#fff',
    },
    pageContainer: {
      paddingBlockPageContainerContent: 16,
      paddingInlinePageContainerContent: 16,
    },
  },
}

export default Setting
