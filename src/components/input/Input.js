import React from 'react';
import { Search } from '@material-ui/icons';

import * as styles from './Input.module.scss';

function Input ({
  placeholder,
  label,
  type = 'text',
  icon,
  unit,
  value,
  onChange,
  paste,
  className
}) {
  async function handlePaste () {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange({ target: { value: text } });
      }
    } catch (err) {
      // navigator clipboard api not supported in client browser
    }
  }

  return (
    <div className={[styles.Input, className].join(' ')}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.field}>
        {icon && <Search className={styles.icon} />}
        <input
          className={styles.input}
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={onChange}
        />
        {unit && <div className={styles.unit}>{unit}</div>}
        {paste && (
          <div onClick={handlePaste} className={styles.paste}>
            Paste
          </div>
        )}
      </div>
    </div>
  );
}

export default Input;
