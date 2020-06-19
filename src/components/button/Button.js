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
import { CircularProgress } from '@material-ui/core';

import Tooltip from 'components/tooltip/Tooltip';

import * as styles from './Button.module.scss';

function Button ({
  children,
  style,
  onClick,
  type,
  disabled,
  loading,
  tooltip = '',
  className
}) {
  return (
    <div
      style={style}
      className={[
        styles.Button,
        type === 'primary' ? styles.primary : '',
        type === 'secondary' ? styles.secondary : '',
        type === 'outline' ? styles.outline : '',
        loading ? styles.disabled : '',
        disabled ? styles.disabled : '',
        className
      ].join(' ')}
      onClick={loading || disabled ? null : onClick}
    >
      {children}
      {loading && (
        <Tooltip title={tooltip}>
          <div className={styles.loading}>
            <CircularProgress size={14} color='inherit' />
          </div>
        </Tooltip>
      )}
    </div>
  );
}

export default React.memo(Button);
