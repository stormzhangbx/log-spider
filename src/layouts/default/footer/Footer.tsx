import { DefaultFooter } from '@ant-design/pro-components'
import React from 'react'

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${new Date().getFullYear()} haiweilian`}
      links={[
        {
          key: 'LogSpider',
          title: 'LogSpider',
          href: 'https://github.com/haiweilian/vivy-nest-admin',
          blankTarget: true,
        },
      ]}
    />
  )
}

export default Footer
