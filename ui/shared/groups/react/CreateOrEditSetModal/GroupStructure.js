/*
 * Copyright (C) 2021 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useContext, useEffect, useState} from 'react'
import {useScope as useI18nScope} from '@canvas/i18n'
import {Text} from '@instructure/ui-text'
import {TextInput} from '@instructure/ui-text-input'
import {Flex} from '@instructure/ui-flex'
import {View} from '@instructure/ui-view'
import {Checkbox} from '@instructure/ui-checkbox'
import {NumberInput} from '@instructure/ui-number-input'
import {Select} from '@instructure/ui-select'
import {FormFieldGroup} from '@instructure/ui-form-field'
import {ScreenReaderContent} from '@instructure/ui-a11y-content'
import {func, string} from 'prop-types'
import {GroupContext, formatMessages, SPLIT} from './context'
import {handleKeyPress} from './utils'

const I18n = useI18nScope('groups')

const I18NSPLIT_PATTERN = /(.+)\s+ZZZ\s(.+)/

const options = [
  {id: '0', label: I18n.t('Create groups later'), dataTestid: 'group-structure-create-later'},
  {
    id: '1',
    label: I18n.t('Split students by number of groups'),
    dataTestid: 'group-structure-num-groups'
  },
  {
    id: '2',
    label: I18n.t('Split number of students per group'),
    dataTestid: 'group-structure-students-per-group'
  }
]

const GroupStructureSelfSignup = ({onChange, errormsg}) => {
  const {createGroupCount, groupLimit} = useContext(GroupContext)

  // Split up the I18n strings so we can put TextInputs in the middle of them
  const createGroups = I18n.t('Create %{number_of_groups} groups now', {
    number_of_groups: 'ZZZ'
  }).match(I18NSPLIT_PATTERN)
  const limitGroupSize = I18n.t('Limit groups to %{group_limit} members', {
    group_limit: 'ZZZ'
  }).match(I18NSPLIT_PATTERN)

  return (
    <FormFieldGroup
      description={
        <ScreenReaderContent>{I18n.t('Group structure for self-signup')}</ScreenReaderContent>
      }
      messages={formatMessages(errormsg)}
      rowSpacing="small"
    >
      <View>
        <Text>{createGroups[1]}</Text>
        &nbsp;
        <TextInput
          display="inline-block"
          width="3rem"
          size="x-small"
          id="textinput-create-groups-now"
          value={createGroupCount}
          renderLabel={
            <ScreenReaderContent>{I18n.t('Number of groups to create')}</ScreenReaderContent>
          }
          onChange={(_e, val) => {
            onChange('createGroupCount', val)
          }}
        />
        &nbsp;
        <Text>{createGroups[2]}</Text>
      </View>
      <View>
        <Text>{limitGroupSize[1]}</Text>
        &nbsp;
        <TextInput
          display="inline-block"
          width="3rem"
          size="x-small"
          id="textinput-limit-group-size"
          value={groupLimit}
          renderLabel={<ScreenReaderContent>{I18n.t('Group Size Limit')}</ScreenReaderContent>}
          onChange={(_e, val) => {
            onChange('groupLimit', val)
          }}
        />
        &nbsp;
        <Text>{limitGroupSize[2]}</Text>
        &nbsp;
        <Text size="small" color="secondary">
          ({I18n.t('Leave blank for no limit')})
        </Text>
      </View>
    </FormFieldGroup>
  )
}

const GroupStructureNoSelfSignup = ({onChange, errormsg}) => {
  const {splitGroups, bySection} = useContext(GroupContext)
  const [isShowingOptions, setIsShowingOptions] = useState(false)
  const [highlightedOptionId, setHighlightedOptionId] = useState(null)
  const [inputId, setInputId] = useState(options[0].id)
  const [inputValue, setInputValue] = useState(options[0].label)
  const [groupNumber, setGroupNumber] = useState(0)
  const [studentNumber, setStudentNumber] = useState(0)

  useEffect(() => {
    onChange('createGroupCount', groupNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupNumber]) // ignoring rule for onChange func which causes infinite rerenders

  useEffect(() => {
    onChange('createGroupMemberCount', studentNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentNumber]) // ignoring rule for onChange func which causes infinite rerenders

  useEffect(() => {
    if (inputId === '0') {
      setStudentNumber(0)
      setGroupNumber(0)
    } else if (inputId === '1' && studentNumber) {
      setStudentNumber(0)
    } else if (inputId === '2' && groupNumber) {
      setGroupNumber(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputId]) // ignoring for causing unnecessary rerenders

  const handleHighlightOption = (event, {id}) => {
    setHighlightedOptionId(id)
  }

  const getOptionById = queryId => {
    return options.find(({id}) => id === queryId)
  }

  const handleSelectOption = (event, {id}) => {
    const option = getOptionById(id)
    setInputValue(option.label)
    setInputId(id)
    setIsShowingOptions(false)
    onChange('splitGroups', id)
  }

  const showSupplementalSelect = () => {
    if (inputId === '1') {
      return (
        <NumberInput
          data-testid="split-groups"
          min={0}
          value={groupNumber}
          renderLabel={<ScreenReaderContent>{I18n.t('Number of groups')}</ScreenReaderContent>}
          onIncrement={() => setGroupNumber(groupNumber + 1)}
          onDecrement={() => {
            if (groupNumber > 0) {
              setGroupNumber(groupNumber - 1)
            }
          }}
          onKeyDown={keyPressed => {
            handleKeyPress(keyPressed, setGroupNumber, groupNumber)
          }}
        />
      )
    } else if (inputId === '2') {
      return (
        <NumberInput
          data-testid="num-students-per-group"
          min={0}
          value={studentNumber}
          renderLabel={
            <ScreenReaderContent>{I18n.t('Number of students per group')}</ScreenReaderContent>
          }
          onIncrement={() => setStudentNumber(studentNumber + 1)}
          onDecrement={() => {
            if (studentNumber > 0) {
              setStudentNumber(studentNumber - 1)
            }
          }}
          onKeyDown={keyPressed => {
            handleKeyPress(keyPressed, setStudentNumber, studentNumber)
          }}
        />
      )
    }
  }

  return (
    <FormFieldGroup
      description={<ScreenReaderContent>{I18n.t('Group structure')}</ScreenReaderContent>}
      messages={formatMessages(errormsg)}
      rowSpacing="small"
    >
      <Select
        data-testid="group-structure-selector"
        renderLabel={
          <ScreenReaderContent>{I18n.t('Group structure for self-signup')}</ScreenReaderContent>
        }
        assistiveText="Use arrow keys to navigate options."
        inputValue={inputValue}
        isShowingOptions={isShowingOptions}
        onBlur={() => setHighlightedOptionId(null)}
        onRequestShowOptions={() => setIsShowingOptions(true)}
        onRequestHideOptions={() => setIsShowingOptions(false)}
        onRequestHighlightOption={handleHighlightOption}
        onRequestSelectOption={handleSelectOption}
      >
        {options.map(option => (
          <Select.Option
            data-testid={option.dataTestid}
            id={option.id}
            key={option.id}
            isHighlighted={highlightedOptionId === option.id}
            isSelected={inputId === option.id}
          >
            {option.label}
          </Select.Option>
        ))}
      </Select>
      {showSupplementalSelect()}
      {splitGroups !== SPLIT.off && (
        <Checkbox
          checked={bySection}
          label={I18n.t('Require group members to be in the same section')}
          onChange={e => {
            onChange('bySection', e.target.checked)
          }}
        />
      )}
    </FormFieldGroup>
  )
}

export const GroupStructure = ({onChange, errormsg}) => {
  /* eslint-disable prettier/prettier */
  const {
    selfSignup,
    createGroupCount,
    createGroupMemberCount,
    bySection,
    splitGroups,
    groupLimit
  } = useContext(GroupContext)
  /* eslint-enable prettier/prettier */

  function handleChange(key, val) {
    let result = {createGroupCount, createGroupMemberCount, bySection, splitGroups, groupLimit}
    result[key] = val
    if (key === 'splitGroups') {
      if (val === SPLIT.byGroupCount) result.createGroupMemberCount = '0'
      if (val === SPLIT.byMemberCount) result.createGroupCount = '0'
      if (val === SPLIT.off)
        result = {...result, bySection: false, createGroupMemberCount: '0', createGroupCount: '0'}
    }
    onChange(result)
  }

  return (
    <Flex>
      <Flex.Item padding="none medium none none">
        <Text>{I18n.t('Group Structure')}</Text>
      </Flex.Item>
      <Flex.Item shouldGrow>
        {selfSignup ? (
          <GroupStructureSelfSignup onChange={handleChange} errormsg={errormsg} />
        ) : (
          <GroupStructureNoSelfSignup onChange={handleChange} errormsg={errormsg} />
        )}
      </Flex.Item>
    </Flex>
  )
}

GroupStructure.propTypes = {
  onChange: func.isRequired,
  errormsg: string
}
