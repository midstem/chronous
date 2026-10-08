import type { ReactElement, ReactNode } from 'react'

import source from '@/components/ui/chronous-calendar?raw'
import { CodeBlock } from '@/code-block'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  BUTTON_COMMAND,
  COMPONENT_PATH,
  DEPENDENCIES_COMMAND,
  INSTALL_COMMAND,
  USAGE
} from './constants'

const Step = ({
  title,
  children
}: {
  title: string
  children?: ReactNode
}): ReactElement => (
  <li className="relative flex flex-col gap-3 border-l pb-8 pl-8 last:pb-0 [counter-increment:step] before:absolute before:-left-3.5 before:grid before:size-7 before:place-items-center before:rounded-full before:border before:bg-background before:font-mono before:text-xs before:content-[counter(step)]">
    <h3 className="pt-0.5 font-medium">{title}</h3>
    {children}
  </li>
)

export const CodePanel = (): ReactElement => (
  <div className="flex flex-col gap-10">
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Installation</h2>
      <Tabs defaultValue="command">
        <TabsList variant="line">
          <TabsTrigger value="command">Command</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>
        <TabsContent className="pt-2" value="command">
          <CodeBlock code={INSTALL_COMMAND} language="bash" />
        </TabsContent>
        <TabsContent className="pt-4" value="manual">
          <ol className="ml-3.5 [counter-reset:step]">
            <Step title="Install the dependencies.">
              <CodeBlock code={DEPENDENCIES_COMMAND} language="bash" />
            </Step>
            <Step title="Add the shadcn/ui button.">
              <CodeBlock code={BUTTON_COMMAND} language="bash" />
            </Step>
            <Step title="Copy and paste the following code into your project.">
              <CodeBlock code={source} fileName={COMPONENT_PATH} />
            </Step>
            <Step title="Update the import paths to match your project setup." />
          </ol>
        </TabsContent>
      </Tabs>
    </section>
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Usage</h2>
      <CodeBlock code={USAGE} />
    </section>
  </div>
)
