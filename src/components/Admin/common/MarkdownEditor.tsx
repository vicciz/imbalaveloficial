"use client";

import { useMemo } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";

import { Textarea } from "@/src/components/ui/textarea";

import { MarkdownEditorProps } from "./types";

export default function MarkdownEditor({
    value,
    onChange,
}: MarkdownEditorProps) {

    const preview = useMemo(() => value, [value]);

    return (

        <Card>

            <CardHeader>

                <CardTitle>

                    Descrição Completa

                </CardTitle>

            </CardHeader>

            <CardContent>

                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Editor */}

                    <div className="space-y-2">

                        <p className="text-sm font-medium">

                            Markdown

                        </p>

                        <Textarea
                            value={value}
                            onChange={(e) =>
                                onChange(e.target.value)
                            }
                            placeholder="Escreva a descrição do produto..."
                            className="min-h-[500px] resize-none font-mono"
                        />

                    </div>

                    {/* Preview */}

                    <div className="space-y-2">

                        <p className="text-sm font-medium">

                            Preview

                        </p>

                        <div className="min-h-[500px] rounded-md border bg-background p-6 overflow-auto prose prose-sm dark:prose-invert max-w-none">

                            {preview ? (

                                <ReactMarkdown
                                    remarkPlugins={[
                                        remarkGfm,
                                        remarkBreaks,
                                    ]}
                                    rehypePlugins={[
                                        rehypeRaw,
                                    ]}
                                >

                                    {preview}

                                </ReactMarkdown>

                            ) : (

                                <p className="text-muted-foreground">

                                    O preview aparecerá aqui...

                                </p>

                            )}

                        </div>

                    </div>

                </div>

            </CardContent>

        </Card>

    );

}