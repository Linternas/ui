import { Badge, Button, Card, Container, Grid, Stack } from '@mingu/interaction-ui/system';

export default function Page() {
  return <Container style={{ paddingBlock: 'var(--mingu-space-12)' }}><Stack gap={8}><header><Badge tone="accent">WORKSPACE</Badge><h1>새로운 프로젝트</h1><p>같은 시스템, 새로운 화면.</p></header><Grid><Card><Stack><h2>시작하기</h2><p>앱의 데이터와 동작을 연결하세요.</p><form action="/projects/new"><Button type="submit">프로젝트 만들기</Button></form></Stack></Card></Grid></Stack></Container>;
}
