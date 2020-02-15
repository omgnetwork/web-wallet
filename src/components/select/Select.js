import React from 'react';
import * as styles from './Select.module.scss';

function Select ({
  label,
  value,
  options,
  onSelect
}) {
  const selected = options.find(i => i.value === value);

  return (
    <div className={styles.Select}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.field}>
        <select
          className={styles.select}
          value={value}
          onChange={onSelect}
        >
          {options.map((i, index) => (
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
        </div>
      </div>
    </div>
  );
}

export default Select;
