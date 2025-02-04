import { ScrollShadow } from '@heroui/react';
import clsx from 'clsx';
import React, { forwardRef, ReactNode } from 'react';

type PageProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
};
const PageRoot = ({ children, sidebar }: PageProps) => {
  return (
    <div className="h-full flex flex">
      <div className="flex-1 flex flex-col h-full overflow-y-hidden">{children}</div>
      {sidebar && <ScrollShadow className="max-w-xs">{sidebar}</ScrollShadow>}
    </div>
  );
};

type PageHeaderProps = {
  children?: ReactNode;
  className?: string;
  title?: ReactNode;
};
const PageHeader = ({ children, className, title }: PageHeaderProps) => {
  return (
    <div className={className}>
      {title && (
        <PageContent>
          <h1 className="text-2xl font-bold">{title}</h1>
        </PageContent>
      )}
      {children}
    </div>
  );
};

type PageFooterProps = {
  children: React.ReactNode;
  className?: string;
};

const PageFooter = ({ children, className }: PageFooterProps) => {
  return <div className={className}>{children}</div>;
};

type PageBodyProps = {
  children: React.ReactNode;
  className?: string;
};
const PageBody = forwardRef<HTMLElement, PageBodyProps>(({ children, className }, ref) => {
  return (
    <ScrollShadow size={20} hideScrollBar ref={ref} className={clsx('flex-1 overflow-y-auto p-4', className)}>
      {children}
    </ScrollShadow>
  );
});

type PageContent = {
  children: React.ReactNode;
  className?: string;
};

const PageContent = ({ children, className }: PageContent) => {
  return <div className={clsx('max-w-4xl mx-auto px-4', className)}>{children}</div>;
};

const Page = Object.assign(PageRoot, {
  Header: PageHeader,
  Body: PageBody,
  Content: PageContent,
  Footer: PageFooter,
});

export { Page };
