import React from 'react';
import { KeyboardArrowDown } from '@material-ui/icons';
import Input from 'components/input/Input';

import * as styles from './InputSelect.module.scss';

function InputSelect ({
  placeholder,
  label,
  value,
  onChange,
  selectOptions,
  onSelect,
  selectValue
}) {
  const selected = selectOptions.find(i => i.value === selectValue)

  const renderUnit = (
    <div className={styles.selectContainer}>
      <select
        className={styles.select}
        value={selectValue}
        onChange={onSelect}
      >
        {selectOptions.map((i, index) => (
          <option
            key={index}
            value={i.value}
          >
            {i.title} - {i.subTitle}
          </option>
        ))}
      </select>
      <div className={styles.selected}>
        <div className={styles.details}>
          <div className={styles.title}>{selected ? selected.title : ''}</div>
          <div className={styles.subTitle}>{selected ? selected.subTitle : ''}</div>
        </div>
        <KeyboardArrowDown />
      </div>
    </div>
  );

  return (
    <Input
      placeholder={placeholder}
      label={label}
      type='number'
      unit={renderUnit}
      value={value}
      onChange={onChange}
    />
  );
}

export default InputSelect;
