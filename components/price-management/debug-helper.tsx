"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Remove the Code import and use pre and code tags directly

interface DebugHelperProps {
  data: any;
  title?: string;
  expanded?: boolean;
}

export function DebugHelper({ data, title = "Debug Data", expanded = false }: Readonly<DebugHelperProps>) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  return (
    <Card className="mt-4 border-dashed border-yellow-500/50">
      <CardHeader className="py-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 px-2 text-xs"
        >
          {isExpanded ? "Hide" : "Show"}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4">
          <pre className="bg-muted text-sm p-4 rounded-md overflow-auto max-h-[400px]">
            <code>
              {JSON.stringify(data, null, 2)}
            </code>
          </pre>
        </CardContent>
      )}
    </Card>
  );
}
