import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectField } from '../../src/components/SelectField'
import { Checkbox } from '../../src/components/Checkbox'
import { Toggle } from '../../src/components/Toggle'

describe('T-C-3 SelectField, Checkbox and Toggle components', () => {
  describe('SelectField', () => {
    it('changes value, shows error, can be disabled', async () => {
      const onChange = vi.fn()
      const { rerender } = render(
        <SelectField label="Account type" onChange={onChange}>
          <option value="admin">Gym admin</option>
          <option value="member">Member</option>
        </SelectField>
      )
      const select = screen.getByLabelText('Account type')
      expect(select).toBeInTheDocument()
      await userEvent.selectOptions(select, 'member')
      expect(select).toHaveValue('member')

      rerender(
        <SelectField label="Account type" error="Please select an option">
          <option value="admin">Gym admin</option>
        </SelectField>
      )
      expect(screen.getByRole('alert')).toHaveTextContent('Please select an option')

      rerender(
        <SelectField label="Account type" disabled>
          <option value="admin">Gym admin</option>
        </SelectField>
      )
      expect(screen.getByLabelText('Account type')).toBeDisabled()
    })
  })

  describe('Checkbox', () => {
    it('changes value, shows error, can be disabled', async () => {
      const onChange = vi.fn()
      const { rerender } = render(
        <Checkbox label="I am 18 or older" onChange={onChange} />
      )
      const checkbox = screen.getByLabelText('I am 18 or older')
      expect(checkbox).not.toBeChecked()
      await userEvent.click(checkbox)
      expect(checkbox).toBeChecked()

      rerender(
        <Checkbox label="I am 18 or older" error="You must be 18 or older" />
      )
      expect(screen.getByRole('alert')).toHaveTextContent('You must be 18 or older')

      rerender(
        <Checkbox label="I am 18 or older" disabled />
      )
      expect(screen.getByLabelText('I am 18 or older')).toBeDisabled()
    })
  })

  describe('Toggle', () => {
    it('changes value and can be disabled', async () => {
      const onChange = vi.fn()
      const { rerender } = render(
        <Toggle label="Payment reminders" onChange={onChange} />
      )
      const toggle = screen.getByLabelText('Payment reminders')
      expect(toggle).not.toBeChecked()
      await userEvent.click(toggle)
      expect(toggle).toBeChecked()

      rerender(
        <Toggle label="Payment reminders" disabled />
      )
      expect(screen.getByLabelText('Payment reminders')).toBeDisabled()
    })
  })
})

