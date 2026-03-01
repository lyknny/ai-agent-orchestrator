import { describe, it, expect, vi } from 'vitest';

// Mocking the agent behavior for unit testing
describe('AI Agent SSE Stream', () => {
  it('should emit events in the correct order', async () => {
    const events: string[] = [];
    const mockSendEvent = (event: string, data: any) => {
      events.push(event);
    };

    // Simulated streaming logic
    const simulateStream = async () => {
      mockSendEvent('heartbeat', { timestamp: '...' });
      mockSendEvent('agent.message.delta', { text: 'Hello' });
      mockSendEvent('agent.message.delta', { text: ' world' });
      mockSendEvent('agent.message.done', { session_id: '123' });
    };

    await simulateStream();

    expect(events).toEqual([
      'heartbeat',
      'agent.message.delta',
      'agent.message.delta',
      'agent.message.done'
    ]);
  });
});
