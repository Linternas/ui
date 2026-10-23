export const aiCatalog = [
  {
    id: "prompt-composer",
    name: "Prompt composer",
    group: "Forms",
    component: "PromptComposer",
    addedAt: "2026-10-23",
    description:
      "실제 파일 첨부·모델 선택·전송·중단을 묶은 입력창. Enter·조합 입력·비동기 실패와 재시도.",
    tags: ["ai", "prompt", "files", "입력"],
  },
  {
    id: "tool-execution-panel",
    name: "Tool execution panel",
    group: "Data display",
    component: "ToolExecutionPanel",
    addedAt: "2026-10-23",
    description:
      "도구의 입력·출력·진행 상태를 펼쳐 봅니다. 안전한 텍스트·실제 복사·실패와 재시도.",
    tags: ["ai", "tool", "json", "실행"],
  },
  {
    id: "plan-review",
    name: "Plan review",
    group: "Data display",
    component: "PlanReview",
    addedAt: "2026-10-23",
    description:
      "실행 전 작업 단계를 검토하고 선택합니다. 호출자 소유 실행·진행·실패·빈 상태.",
    tags: ["ai", "plan", "steps", "계획"],
  },
  {
    id: "approval-card",
    name: "Approval card",
    group: "Actions",
    component: "ApprovalCard",
    addedAt: "2026-10-23",
    description:
      "변경 내용을 확인한 뒤 승인하거나 거절합니다. 비동기 처리·중복 방지·실패와 재시도.",
    tags: ["ai", "approval", "confirm", "승인"],
  },
  {
    id: "context-usage-meter",
    name: "Context usage meter",
    group: "Feedback",
    component: "ContextUsageMeter",
    addedAt: "2026-10-23",
    description:
      "문맥 사용량 링과 입력·출력·캐시 상세를 확인합니다. 캐시 중복 합산 없이 실제 값 표현.",
    tags: ["ai", "tokens", "usage", "사용량"],
  },
  {
    id: "artifact-panel",
    name: "Artifact panel",
    group: "Data display",
    component: "ArtifactPanel",
    addedAt: "2026-10-23",
    description:
      "문서와 코드를 편집·미리보기·복사·다운로드합니다. 호출자 제공 미리보기와 실제 저장 콜백.",
    tags: ["ai", "artifact", "editor", "결과물"],
  },
  {
    id: "checkpoint",
    name: "Checkpoint",
    group: "Actions",
    component: "Checkpoint",
    addedAt: "2026-10-23",
    description:
      "작업의 시점을 확인하고 복원합니다. 실제 이력 콜백·복원 확인·오류·현재 상태.",
    tags: ["ai", "history", "restore", "복원"],
  },
  {
    id: "model-selector",
    name: "Model selector",
    group: "Forms",
    component: "ModelSelector",
    addedAt: "2026-10-23",
    description:
      "모델과 공급사를 검색해 선택합니다. 키보드·비활성 모델·빈 결과·모달 포커스 복귀.",
    tags: ["ai", "model", "search", "선택"],
  },
  {
    id: "voice-input",
    name: "Voice input",
    group: "Forms",
    component: "VoiceInput",
    addedAt: "2026-10-23",
    description:
      "사용자가 시작한 음성을 텍스트로 변환합니다. 브라우저 음성 서비스·거부·미지원·직접 입력 대안.",
    tags: ["ai", "speech", "microphone", "음성"],
  },
  {
    id: "streaming-terminal",
    name: "Streaming terminal",
    group: "Data display",
    component: "StreamingTerminal",
    addedAt: "2026-10-23",
    description:
      "계속 추가되는 로그를 안전한 텍스트로 보여줍니다. 검색·자동 스크롤 중지·실제 복사·표시 상한.",
    tags: ["ai", "logs", "stream", "터미널"],
  },
] as const;
export const aiExamples = {
  "prompt-composer": `<PromptComposer onSubmit={async ({ text, files, model }, { signal }) => { await sendMessage({ text, files, model, signal }); }} onStop={stopResponse} />`,
  "tool-execution-panel": `<ToolExecutionPanel name="search_documents" status="success" input={{ query: 'Design tokens' }} output={{ results: 3 }} duration={210} />`,
  "plan-review": `<PlanReview steps={[{ id: 'outline', title: 'Create an outline', description: 'Start with the structure.' }, { id: 'review', title: 'Review the details' }]} onRun={runSelectedSteps} />`,
  "approval-card": `<ApprovalCard title="Apply these changes?" description="Review the exact change first." onApprove={approveChange} onReject={declineChange}><p>One draft title will be updated.</p></ApprovalCard>`,
  "context-usage-meter": `<ContextUsageMeter inputTokens={12400} cachedTokens={4800} outputTokens={3200} maxTokens={64000} />`,
  "artifact-panel": `<ArtifactPanel title="Field notes" filename="notes.md" language="markdown" content={document} onContentChange={setDocument} editable onSave={saveDocument} />`,
  checkpoint: `<Checkpoint title="Before the rewrite" description="The original outline." onRestore={restoreSnapshot} current={isCurrent} />`,
  "model-selector": `<ModelSelector models={[{ id: 'swift', name: 'Swift', provider: 'Workspace' }, { id: 'studio', name: 'Studio', provider: 'Workspace' }]} value={model} onValueChange={setModel} />`,
  "voice-input": `<VoiceInput value={transcript} onValueChange={setTranscript} lang="ko-KR" />`,
  "streaming-terminal": `<StreamingTerminal title="Build output" lines={logs} maxLines={500} onClear={() => setLogs([])} />`,
} satisfies Record<string, string>;
