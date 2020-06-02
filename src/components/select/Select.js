/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import React from 'react';
import * as styles from './Select.module.scss';

function Select ({
  label,
  value,
  options,
  onSelect,
  loading,
  error = ''
}) {
  const selected = options.find(i => i.value === value);

  const renderLoading = (
    <div className={[styles.selected, styles.loading].join(' ')}>
      Loading...
    </div>
  );

  const renderSelect = (
    <>
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
          <div className={styles.title}>{selected ? selected.title : error}</div>
          <div className={styles.subTitle}>{selected ? selected.subTitle : ''}</div>
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.Select}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.field}>
        {loading ? renderLoading : renderSelect}
      </div>
    </div>
  );
}

export default React.memo(Select);
