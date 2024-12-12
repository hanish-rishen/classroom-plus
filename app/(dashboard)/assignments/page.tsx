'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

type Assignment = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: string;
};

const columns: ColumnDef<Assignment>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'subject',
    header: 'Subject',
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
          status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
          {status}
        </div>
      );
    },
  },
];

const data: Assignment[] = [
  {
    id: '1',
    title: 'Math Homework',
    subject: 'Mathematics',
    dueDate: '2024-02-15',
    status: 'In Progress',
  },
  {
    id: '2',
    title: 'History Essay',
    subject: 'History',
    dueDate: '2024-02-18',
    status: 'Not Started',
  },
  {
    id: '3',
    title: 'Science Project',
    subject: 'Science',
    dueDate: '2024-02-10',
    status: 'Completed',
  },
];

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold md:text-3xl">Assignments</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Assignment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  );
}