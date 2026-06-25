import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  type ConfirmationToolPart,
  ConfirmationTitle,
} from './index';

const approvalRequestedPart: ConfirmationToolPart = {
  type: 'tool-deleteFile',
  toolCallId: 'call-1',
  state: 'approval-requested',
  input: {
    path: '/tmp/report.md',
  },
  approval: {
    id: 'approval-1',
  },
};

const approvedPart: ConfirmationToolPart = {
  type: 'tool-deleteFile',
  toolCallId: 'call-1',
  state: 'output-available',
  input: {
    path: '/tmp/report.md',
  },
  output: {
    deleted: true,
  },
  approval: {
    id: 'approval-1',
    approved: true,
  },
};

const rejectedPart: ConfirmationToolPart = {
  type: 'tool-deleteFile',
  toolCallId: 'call-1',
  state: 'approval-responded',
  input: {
    path: '/tmp/report.md',
  },
  approval: {
    id: 'approval-1',
    approved: false,
    reason: 'User denied it.',
  },
};

const inputAvailablePart: ConfirmationToolPart = {
  type: 'tool-deleteFile',
  toolCallId: 'call-1',
  state: 'input-available',
  input: {
    path: '/tmp/report.md',
  },
};

@Component({
  imports: [
    Confirmation,
    ConfirmationAccepted,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationRejected,
    ConfirmationRequest,
    ConfirmationTitle,
  ],
  template: `
    <ai-confirmation [part]="part()" class="custom-confirmation">
      <ai-confirmation-title />
      <ai-confirmation-request>Needs approval</ai-confirmation-request>
      <ai-confirmation-accepted>Accepted</ai-confirmation-accepted>
      <ai-confirmation-rejected>Rejected</ai-confirmation-rejected>
      <ai-confirmation-actions class="custom-actions">
        <button aiConfirmationAction>Approve</button>
        <button aiConfirmationAction variant="outline">Reject</button>
      </ai-confirmation-actions>
    </ai-confirmation>
  `,
})
class Host {
  readonly part = signal<ConfirmationToolPart>(approvalRequestedPart);
}

describe('Confirmation', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders approval request content and actions when approval is requested', () => {
    const element = fixture.nativeElement as HTMLElement;
    const confirmation = element.querySelector('ai-confirmation');

    expect(confirmation?.hasAttribute('hidden')).toBe(false);
    expect(confirmation?.classList).toContain('border');
    expect(confirmation?.classList).toContain('custom-confirmation');
    expect(element.textContent).toContain('Approval required');
    expect(element.textContent).toContain('Needs approval');
    expect(element.textContent).toContain('Approve');
    expect(element.textContent).toContain('Reject');
    expect(element.textContent).not.toContain('Accepted');
    expect(element.textContent).not.toContain('Rejected');
  });

  it('renders accepted content for approved response states', () => {
    fixture.componentInstance.part.set(approvedPart);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Approved');
    expect(element.textContent).toContain('Accepted');
    expect(element.textContent).not.toContain('Needs approval');
    expect(element.querySelector('button')).toBeNull();
  });

  it('renders rejected content for rejected response states', () => {
    fixture.componentInstance.part.set(rejectedPart);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Rejected');
    expect(element.textContent).not.toContain('Needs approval');
    expect(element.textContent).not.toContain('Accepted');
  });

  it('hides confirmation when the tool part has no approval', () => {
    fixture.componentInstance.part.set(inputAvailablePart);
    fixture.detectChanges();

    const confirmation = (fixture.nativeElement as HTMLElement).querySelector('ai-confirmation');

    expect(confirmation?.hasAttribute('hidden')).toBe(true);
  });
});
