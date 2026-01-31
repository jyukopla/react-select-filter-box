/**
 * Real-World Examples Stories
 *
 * Demonstrates practical use cases for the FilterBox component
 * with complete schema configurations.
 */

import type { Meta, StoryObj } from '@storybook/react'
import { useState, useCallback } from 'react'
import type { FilterExpression, FilterSchema } from '@/types'
import { FilterBox } from './FilterBox'
import { createStaticAutocompleter, createEnumAutocompleter } from '@/autocompleters'

const meta = {
  title: 'FilterBox/Real-World Examples',
  component: FilterBox,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FilterBox>

export default meta
type Story = StoryObj<typeof meta>

// =============================================================================
// Process Instance Filter (Process Engine Example)
// =============================================================================

const processInstanceSchema: FilterSchema = {
  fields: [
    {
      key: 'processInstanceId',
      label: 'Process Instance ID',
      type: 'id',
      description: 'Unique identifier of the process instance',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    {
      key: 'businessKey',
      label: 'Business Key',
      type: 'string',
      description: 'Business-specific identifier',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'like', label: 'like' },
      ],
    },
    {
      key: 'processDefinitionKey',
      label: 'Process Definition',
      type: 'enum',
      description: 'The type of process',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'order-processing', label: 'Order Processing', description: 'E-commerce order workflow' },
        { key: 'customer-onboarding', label: 'Customer Onboarding', description: 'New customer registration' },
        { key: 'invoice-approval', label: 'Invoice Approval', description: 'Finance approval workflow' },
        { key: 'support-ticket', label: 'Support Ticket', description: 'Customer support handling' },
        { key: 'employee-offboarding', label: 'Employee Offboarding', description: 'HR offboarding process' },
      ]),
    },
    {
      key: 'startedBefore',
      label: 'Started Before',
      type: 'datetime',
      description: 'Filter by process start time',
      operators: [{ key: 'before', label: 'before' }],
    },
    {
      key: 'startedAfter',
      label: 'Started After',
      type: 'datetime',
      operators: [{ key: 'after', label: 'after' }],
    },
    {
      key: 'finishedBefore',
      label: 'Finished Before',
      type: 'datetime',
      operators: [{ key: 'before', label: 'before' }],
    },
    {
      key: 'finishedAfter',
      label: 'Finished After',
      type: 'datetime',
      operators: [{ key: 'after', label: 'after' }],
    },
    {
      key: 'state',
      label: 'State',
      type: 'enum',
      description: 'Current state of the process instance',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'ACTIVE', label: 'Active', description: 'Running process instances' },
        { key: 'SUSPENDED', label: 'Suspended', description: 'Paused process instances' },
        { key: 'COMPLETED', label: 'Completed', description: 'Finished through normal end event' },
        { key: 'EXTERNALLY_TERMINATED', label: 'Externally Terminated', description: 'Cancelled via API' },
        { key: 'INTERNALLY_TERMINATED', label: 'Internally Terminated', description: 'Terminated by error event' },
      ]),
    },
    {
      key: 'startedBy',
      label: 'Started By',
      type: 'string',
      description: 'User who started the process',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    {
      key: 'tenantId',
      label: 'Tenant',
      type: 'enum',
      description: 'Multi-tenant identifier',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'tenant-a', label: 'Tenant A' },
        { key: 'tenant-b', label: 'Tenant B' },
        { key: 'tenant-c', label: 'Tenant C' },
      ]),
    },
    {
      key: 'hasIncidents',
      label: 'Has Incidents',
      type: 'boolean',
      description: 'Filter by incident status',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter(['true', 'false']),
    },
  ],
}

export const ProcessInstanceFilter: Story = {
  args: {
    schema: processInstanceSchema,
    expressions: [],
    placeholder: 'Filter process instances...',
  },
  parameters: {
    docs: {
      description: {
        story: `
A complete process instance filter for a BPM/workflow engine.
This demonstrates filtering process instances by various criteria like state, dates, and business keys.
        `,
      },
    },
  },
}

// =============================================================================
// Task Filter (Process Engine Example)
// =============================================================================

const taskSchema: FilterSchema = {
  fields: [
    {
      key: 'taskId',
      label: 'Task ID',
      type: 'id',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    {
      key: 'taskName',
      label: 'Task Name',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'like', label: 'like' },
      ],
    },
    {
      key: 'assignee',
      label: 'Assignee',
      type: 'string',
      description: 'User assigned to the task',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'isNull', label: 'is unassigned', valueRequired: false },
      ],
    },
    {
      key: 'candidateGroup',
      label: 'Candidate Group',
      type: 'enum',
      description: 'Group that can claim the task',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'sales', label: 'Sales Team' },
        { key: 'support', label: 'Support Team' },
        { key: 'finance', label: 'Finance Team' },
        { key: 'engineering', label: 'Engineering' },
        { key: 'management', label: 'Management' },
      ]),
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'number',
      description: 'Task priority (0-100)',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'gt', label: 'greater than', symbol: '>' },
        { key: 'lt', label: 'less than', symbol: '<' },
        { key: 'between', label: 'between', multiValue: { count: 2, separator: 'and', labels: ['min', 'max'] } },
      ],
    },
    {
      key: 'dueBefore',
      label: 'Due Before',
      type: 'datetime',
      operators: [{ key: 'before', label: 'before' }],
    },
    {
      key: 'dueAfter',
      label: 'Due After',
      type: 'datetime',
      operators: [{ key: 'after', label: 'after' }],
    },
    {
      key: 'followUpBefore',
      label: 'Follow-up Before',
      type: 'datetime',
      operators: [{ key: 'before', label: 'before' }],
    },
    {
      key: 'createdBefore',
      label: 'Created Before',
      type: 'datetime',
      operators: [{ key: 'before', label: 'before' }],
    },
    {
      key: 'createdAfter',
      label: 'Created After',
      type: 'datetime',
      operators: [{ key: 'after', label: 'after' }],
    },
  ],
}

export const TaskFilter: Story = {
  args: {
    schema: taskSchema,
    expressions: [],
    placeholder: 'Filter tasks...',
  },
}

// =============================================================================
// E-commerce Product Filter
// =============================================================================

const productSchema: FilterSchema = {
  fields: [
    {
      key: 'sku',
      label: 'SKU',
      type: 'id',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'startsWith', label: 'starts with' },
      ],
    },
    {
      key: 'name',
      label: 'Product Name',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'contains', label: 'contains' },
        { key: 'startsWith', label: 'starts with' },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'electronics', label: 'Electronics', group: 'Technology' },
        { key: 'computers', label: 'Computers', group: 'Technology' },
        { key: 'phones', label: 'Phones', group: 'Technology' },
        { key: 'clothing', label: 'Clothing', group: 'Fashion' },
        { key: 'shoes', label: 'Shoes', group: 'Fashion' },
        { key: 'accessories', label: 'Accessories', group: 'Fashion' },
        { key: 'home', label: 'Home & Garden', group: 'Lifestyle' },
        { key: 'sports', label: 'Sports & Outdoors', group: 'Lifestyle' },
      ]),
    },
    {
      key: 'price',
      label: 'Price',
      type: 'number',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'lt', label: 'less than', symbol: '<' },
        { key: 'gt', label: 'greater than', symbol: '>' },
        { key: 'between', label: 'between', multiValue: { count: 2, separator: 'and', labels: ['min', 'max'] } },
      ],
      serialize: (value) => Math.round(Number(value.raw) * 100), // dollars to cents
      deserialize: (serialized) => ({
        raw: Number(serialized) / 100,
        display: `$${(Number(serialized) / 100).toFixed(2)}`,
        serialized: String(Number(serialized) / 100),
      }),
    },
    {
      key: 'stock',
      label: 'Stock Quantity',
      type: 'number',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'gt', label: 'greater than', symbol: '>' },
        { key: 'lt', label: 'less than', symbol: '<' },
        { key: 'lte', label: 'less than or equal', symbol: '≤' },
      ],
    },
    {
      key: 'inStock',
      label: 'In Stock',
      type: 'boolean',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter(['Yes', 'No']),
    },
    {
      key: 'brand',
      label: 'Brand',
      type: 'string',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
    },
    {
      key: 'rating',
      label: 'Rating',
      type: 'number',
      description: 'Average customer rating (1-5)',
      operators: [
        { key: 'gte', label: 'at least', symbol: '≥' },
        { key: 'eq', label: 'exactly', symbol: '=' },
      ],
    },
    {
      key: 'createdAt',
      label: 'Added On',
      type: 'date',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
        { key: 'between', label: 'between', multiValue: { count: 2, separator: 'and', labels: ['from', 'to'] } },
      ],
    },
    {
      key: 'featured',
      label: 'Featured',
      type: 'boolean',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter(['Yes', 'No']),
    },
  ],
}

export const EcommerceProductFilter: Story = {
  args: {
    schema: productSchema,
    expressions: [],
    placeholder: 'Search products...',
  },
}

// =============================================================================
// Issue Tracker Filter
// =============================================================================

const issueSchema: FilterSchema = {
  fields: [
    {
      key: 'issueKey',
      label: 'Issue Key',
      type: 'id',
      description: 'e.g., PROJ-123',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    {
      key: 'summary',
      label: 'Summary',
      type: 'string',
      operators: [
        { key: 'contains', label: 'contains' },
        { key: 'startsWith', label: 'starts with' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '≠' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'open', label: 'Open', description: 'Newly created issues' },
        { key: 'in-progress', label: 'In Progress', description: 'Currently being worked on' },
        { key: 'in-review', label: 'In Review', description: 'Awaiting code review' },
        { key: 'testing', label: 'Testing', description: 'In QA' },
        { key: 'resolved', label: 'Resolved', description: 'Fixed, pending verification' },
        { key: 'closed', label: 'Closed', description: 'Completed and verified' },
        { key: 'wont-fix', label: "Won't Fix", description: 'Declined to fix' },
      ]),
    },
    {
      key: 'type',
      label: 'Issue Type',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'bug', label: '🐛 Bug' },
        { key: 'feature', label: '✨ Feature' },
        { key: 'improvement', label: '📈 Improvement' },
        { key: 'task', label: '📋 Task' },
        { key: 'epic', label: '🎯 Epic' },
        { key: 'story', label: '📖 Story' },
      ]),
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'critical', label: '🔴 Critical' },
        { key: 'high', label: '🟠 High' },
        { key: 'medium', label: '🟡 Medium' },
        { key: 'low', label: '🟢 Low' },
        { key: 'trivial', label: '⚪ Trivial' },
      ]),
    },
    {
      key: 'assignee',
      label: 'Assignee',
      type: 'string',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'isNull', label: 'is unassigned', valueRequired: false },
        { key: 'isNotNull', label: 'is assigned', valueRequired: false },
      ],
    },
    {
      key: 'reporter',
      label: 'Reporter',
      type: 'string',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
    },
    {
      key: 'label',
      label: 'Label',
      type: 'string',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
    },
    {
      key: 'component',
      label: 'Component',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'frontend', label: 'Frontend' },
        { key: 'backend', label: 'Backend' },
        { key: 'api', label: 'API' },
        { key: 'database', label: 'Database' },
        { key: 'infrastructure', label: 'Infrastructure' },
        { key: 'mobile', label: 'Mobile App' },
        { key: 'docs', label: 'Documentation' },
      ]),
    },
    {
      key: 'createdDate',
      label: 'Created',
      type: 'date',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
      ],
    },
    {
      key: 'updatedDate',
      label: 'Updated',
      type: 'date',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
      ],
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      type: 'date',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
        { key: 'isNull', label: 'is not set', valueRequired: false },
      ],
    },
  ],
}

export const IssueTrackerFilter: Story = {
  args: {
    schema: issueSchema,
    expressions: [],
    placeholder: 'Search issues... (e.g., status = Open)',
  },
}

// =============================================================================
// User Management Filter
// =============================================================================

const userSchema: FilterSchema = {
  fields: [
    {
      key: 'userId',
      label: 'User ID',
      type: 'id',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    {
      key: 'email',
      label: 'Email',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'contains', label: 'contains' },
        { key: 'endsWith', label: 'ends with' },
      ],
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (value.raw && !emailRegex.test(String(value.raw))) {
          return {
            valid: false,
            errors: [{ type: 'value', message: 'Invalid email format' }],
          }
        }
        return { valid: true, errors: [] }
      },
    },
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'contains', label: 'contains' },
        { key: 'startsWith', label: 'starts with' },
      ],
    },
    {
      key: 'role',
      label: 'Role',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'admin', label: 'Administrator', description: 'Full system access' },
        { key: 'manager', label: 'Manager', description: 'Team management access' },
        { key: 'user', label: 'Standard User', description: 'Basic access' },
        { key: 'viewer', label: 'Viewer', description: 'Read-only access' },
        { key: 'guest', label: 'Guest', description: 'Limited access' },
      ]),
    },
    {
      key: 'status',
      label: 'Account Status',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'neq', label: 'is not', symbol: '≠' },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'active', label: 'Active' },
        { key: 'inactive', label: 'Inactive' },
        { key: 'pending', label: 'Pending Verification' },
        { key: 'suspended', label: 'Suspended' },
        { key: 'deleted', label: 'Deleted' },
      ]),
    },
    {
      key: 'department',
      label: 'Department',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'engineering', label: 'Engineering' },
        { key: 'product', label: 'Product' },
        { key: 'design', label: 'Design' },
        { key: 'marketing', label: 'Marketing' },
        { key: 'sales', label: 'Sales' },
        { key: 'support', label: 'Customer Support' },
        { key: 'hr', label: 'Human Resources' },
        { key: 'finance', label: 'Finance' },
      ]),
    },
    {
      key: 'createdAt',
      label: 'Account Created',
      type: 'date',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
      ],
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      type: 'datetime',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
      ],
    },
    {
      key: 'mfaEnabled',
      label: 'MFA Enabled',
      type: 'boolean',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter(['Yes', 'No']),
    },
  ],
}

export const UserManagementFilter: Story = {
  args: {
    schema: userSchema,
    expressions: [],
    placeholder: 'Search users...',
  },
}

// =============================================================================
// Log Search Filter (Observability)
// =============================================================================

const logSchema: FilterSchema = {
  fields: [
    {
      key: 'level',
      label: 'Log Level',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
        { key: 'gte', label: 'at least', symbol: '≥' },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'trace', label: 'TRACE' },
        { key: 'debug', label: 'DEBUG' },
        { key: 'info', label: 'INFO' },
        { key: 'warn', label: 'WARN' },
        { key: 'error', label: 'ERROR' },
        { key: 'fatal', label: 'FATAL' },
      ]),
    },
    {
      key: 'message',
      label: 'Message',
      type: 'string',
      operators: [
        { key: 'contains', label: 'contains' },
        { key: 'like', label: 'matches pattern' },
        { key: 'eq', label: 'equals', symbol: '=' },
      ],
    },
    {
      key: 'service',
      label: 'Service',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'api-gateway', label: 'API Gateway' },
        { key: 'auth-service', label: 'Auth Service' },
        { key: 'user-service', label: 'User Service' },
        { key: 'order-service', label: 'Order Service' },
        { key: 'payment-service', label: 'Payment Service' },
        { key: 'notification-service', label: 'Notification Service' },
        { key: 'analytics-service', label: 'Analytics Service' },
      ]),
    },
    {
      key: 'traceId',
      label: 'Trace ID',
      type: 'id',
      description: 'Distributed tracing identifier',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    {
      key: 'spanId',
      label: 'Span ID',
      type: 'id',
      operators: [{ key: 'eq', label: 'equals', symbol: '=' }],
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      type: 'datetime',
      operators: [
        { key: 'before', label: 'before' },
        { key: 'after', label: 'after' },
        { key: 'between', label: 'between', multiValue: { count: 2, separator: 'and', labels: ['from', 'to'] } },
      ],
    },
    {
      key: 'duration',
      label: 'Duration (ms)',
      type: 'number',
      description: 'Request duration in milliseconds',
      operators: [
        { key: 'gt', label: 'greater than', symbol: '>' },
        { key: 'lt', label: 'less than', symbol: '<' },
        { key: 'gte', label: 'at least', symbol: '≥' },
        { key: 'between', label: 'between', multiValue: { count: 2, separator: 'and', labels: ['min', 'max'] } },
      ],
    },
    {
      key: 'statusCode',
      label: 'HTTP Status',
      type: 'number',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'gte', label: 'at least', symbol: '≥' },
        { key: 'lt', label: 'less than', symbol: '<' },
      ],
    },
    {
      key: 'method',
      label: 'HTTP Method',
      type: 'enum',
      operators: [
        { key: 'eq', label: 'is', symbol: '=' },
        { key: 'in', label: 'in', multiValue: { count: -1, separator: ',', labels: [] } },
      ],
      valueAutocompleter: createEnumAutocompleter([
        { key: 'GET', label: 'GET' },
        { key: 'POST', label: 'POST' },
        { key: 'PUT', label: 'PUT' },
        { key: 'PATCH', label: 'PATCH' },
        { key: 'DELETE', label: 'DELETE' },
        { key: 'OPTIONS', label: 'OPTIONS' },
      ]),
    },
    {
      key: 'path',
      label: 'Path',
      type: 'string',
      operators: [
        { key: 'eq', label: 'equals', symbol: '=' },
        { key: 'startsWith', label: 'starts with' },
        { key: 'contains', label: 'contains' },
        { key: 'like', label: 'matches pattern' },
      ],
    },
    {
      key: 'hasException',
      label: 'Has Exception',
      type: 'boolean',
      operators: [{ key: 'eq', label: 'is', symbol: '=' }],
      valueAutocompleter: createStaticAutocompleter(['true', 'false']),
    },
  ],
}

export const LogSearchFilter: Story = {
  args: {
    schema: logSchema,
    expressions: [],
    placeholder: 'Search logs... (level = ERROR, service = api-gateway)',
  },
}

// =============================================================================
// Interactive API Filter Builder
// =============================================================================

function InteractiveApiFilterComponent() {
  const [expressions, setExpressions] = useState<FilterExpression[]>([])
  const [apiQuery, setApiQuery] = useState<string>('')

  const handleChange = useCallback((newExpressions: FilterExpression[]) => {
    setExpressions(newExpressions)
    
    // Build a simplified API query representation
    const params = newExpressions.map((expr) => {
      const field = expr.condition.field.key
      const operator = expr.condition.operator.key
      const value = expr.condition.value.serialized
      return `${field}[${operator}]=${encodeURIComponent(String(value))}`
    })
    setApiQuery(params.join('&'))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <FilterBox
        schema={processInstanceSchema}
        expressions={expressions}
        onChange={handleChange}
        placeholder="Build your API filter..."
      />
      
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
          Generated API Query:
        </div>
        <code
          style={{
            display: 'block',
            padding: '12px',
            backgroundColor: '#1e293b',
            color: '#22d3ee',
            borderRadius: '4px',
            fontSize: '13px',
            fontFamily: 'monospace',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {apiQuery || 'No filters applied'}
        </code>
      </div>

      <div
        style={{
          padding: '12px',
          backgroundColor: '#ecfdf5',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#065f46',
        }}
      >
        💡 <strong>Tip:</strong> Try adding filters to see the generated API
        query string update in real-time.
      </div>
    </div>
  )
}

export const InteractiveApiFilterBuilder: Story = {
  render: () => <InteractiveApiFilterComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows how the FilterBox can be used to build API query parameters in real-time.',
      },
    },
  },
}
