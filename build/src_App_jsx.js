"use strict";
(globalThis["webpackChunkblank_theme"] = globalThis["webpackChunkblank_theme"] || []).push([["src_App_jsx"],{

/***/ "./src/App.jsx"
/*!*********************!*\
  !*** ./src/App.jsx ***!
  \*********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ App)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _mui_material_Dialog__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @mui/material/Dialog */ "./node_modules/@mui/material/esm/Dialog/Dialog.js");
/* harmony import */ var _mui_material_DialogTitle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @mui/material/DialogTitle */ "./node_modules/@mui/material/esm/DialogTitle/DialogTitle.js");
/* harmony import */ var _mui_material_DialogContent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @mui/material/DialogContent */ "./node_modules/@mui/material/esm/DialogContent/DialogContent.js");
/* harmony import */ var _mui_material_DialogContentText__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @mui/material/DialogContentText */ "./node_modules/@mui/material/esm/DialogContentText/DialogContentText.js");
/* harmony import */ var _mui_material_DialogActions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @mui/material/DialogActions */ "./node_modules/@mui/material/esm/DialogActions/DialogActions.js");
/* harmony import */ var _mui_material_Snackbar__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @mui/material/Snackbar */ "./node_modules/@mui/material/esm/Snackbar/Snackbar.js");
/* harmony import */ var _mui_material_Alert__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @mui/material/Alert */ "./node_modules/@mui/material/esm/Alert/Alert.js");
/* harmony import */ var _contexts_AdminDataContext__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./contexts/AdminDataContext */ "./src/contexts/AdminDataContext.jsx");
/* harmony import */ var _mui_material_Box__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @mui/material/Box */ "./node_modules/@mui/material/esm/Box/Box.js");
/* harmony import */ var _mui_material_TextField__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @mui/material/TextField */ "./node_modules/@mui/material/esm/TextField/TextField.js");
/* harmony import */ var _mui_material_Switch__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @mui/material/Switch */ "./node_modules/@mui/material/esm/Switch/Switch.js");
/* harmony import */ var _mui_material_FormControlLabel__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @mui/material/FormControlLabel */ "./node_modules/@mui/material/esm/FormControlLabel/FormControlLabel.js");
/* harmony import */ var _mui_material_FormControl__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @mui/material/FormControl */ "./node_modules/@mui/material/esm/FormControl/FormControl.js");
/* harmony import */ var _mui_material_InputLabel__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @mui/material/InputLabel */ "./node_modules/@mui/material/esm/InputLabel/InputLabel.js");
/* harmony import */ var _mui_material_Select__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @mui/material/Select */ "./node_modules/@mui/material/esm/Select/Select.js");
/* harmony import */ var _mui_material_MenuItem__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! @mui/material/MenuItem */ "./node_modules/@mui/material/esm/MenuItem/MenuItem.js");
/* harmony import */ var _mui_material_Button__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @mui/material/Button */ "./node_modules/@mui/material/esm/Button/Button.js");
/* harmony import */ var _mui_material_Stack__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @mui/material/Stack */ "./node_modules/@mui/material/esm/Stack/Stack.js");
/* harmony import */ var _mui_material_Paper__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! @mui/material/Paper */ "./node_modules/@mui/material/esm/Paper/Paper.js");
/* harmony import */ var _mui_material_Divider__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! @mui/material/Divider */ "./node_modules/@mui/material/esm/Divider/Divider.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__);























function App() {
  const adminData = (0,_contexts_AdminDataContext__WEBPACK_IMPORTED_MODULE_8__.useAdminData)();
  const [adminDataLoading, setAdminDataLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [users, setUsers] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [adminOptions, setAdminOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  const [form, setForm] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    rest_api_user_id: adminOptions?.rest_api_user_id?.value || '',
    rest_api_password_name: adminOptions?.rest_api_password_name?.value || '',
    application_user_id: adminOptions?.application_user_id?.value || '',
    application_password_name: adminOptions?.application_password_name?.value || '',
    application_host: adminOptions?.application_host?.value || '',
    application_cache_route: adminOptions?.application_cache_route?.value || '',
    disable_comments: !!adminOptions?.disable_comments?.value,
    max_upload_size: adminOptions?.max_upload_size?.value || ''
  });

  // Dialog and Snackbar states
  const [confirmOpen, setConfirmOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [snackbarOpen, setSnackbarOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [snackbarMessage, setSnackbarMessage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [snackbarSeverity, setSnackbarSeverity] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('success');
  const restPasswordOptions = (() => {
    const selectedUser = users.find(u => u.value === form.rest_api_user_id);
    if (selectedUser && selectedUser.password_names) {
      return Object.entries(selectedUser.password_names).map(([index, name]) => ({
        value: name,
        label: name
      }));
    }
    return [];
  })();
  const applicationPasswordOptions = (() => {
    const selectedUser = users.find(u => u.value === form.application_user_id);
    if (selectedUser && selectedUser.password_names) {
      return Object.entries(selectedUser.password_names).map(([index, name]) => ({
        value: name,
        label: name
      }));
    }
    return [];
  })();
  (0,react__WEBPACK_IMPORTED_MODULE_21__.useEffect)(() => {
    if (!adminData && adminDataLoading) {
      return;
    }
    setAdminDataLoading(false);
    if (adminData && Array.isArray(adminData.users)) {
      setUsers(adminData.users);
    }
    if (adminData && adminData.admin_options) {
      const adminOptions = adminData.admin_options;
      setAdminOptions(adminOptions);
      setForm({
        rest_api_user_id: adminOptions.rest_api_user_id?.value || '',
        rest_api_password_name: adminOptions.rest_api_password_name?.value || '',
        application_user_id: adminOptions.application_user_id?.value || '',
        application_password_name: adminOptions.application_password_name?.value || '',
        application_host: adminOptions.application_host?.value || '',
        application_cache_route: adminOptions.application_cache_route?.value || '',
        disable_comments: !!adminOptions.disable_comments?.value,
        max_upload_size: adminOptions.max_upload_size?.value || ''
      });
    }
  }, [adminData, adminDataLoading]);
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    setConfirmOpen(true);
  };
  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    if (!adminData?.nonce || !adminData?.ajaxurl) {
      setSnackbarMessage('Missing AJAX configuration.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    try {
      const response = await fetch(adminData.ajaxurl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: new URLSearchParams({
          action: 'blank_theme_update_options',
          nonce: adminData.nonce,
          options: JSON.stringify(form)
        })
      });
      const data = await response.json();
      if (data.success) {
        setSnackbarMessage('Settings saved successfully!');
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Error: ' + (data.data?.error || 'Unknown error'));
        setSnackbarSeverity('error');
      }
    } catch (err) {
      setSnackbarMessage('AJAX error: ' + err.message);
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };
  const handleCancelSave = () => {
    setConfirmOpen(false);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };
  (0,react__WEBPACK_IMPORTED_MODULE_21__.useEffect)(() => {
    if (form.rest_api_user_id === '') {
      setForm(prev => ({
        ...prev,
        rest_api_password_name: ''
      }));
    }
  }, [form.rest_api_user_id]);
  (0,react__WEBPACK_IMPORTED_MODULE_21__.useEffect)(() => {
    if (form.application_user_id === '') {
      setForm(prev => ({
        ...prev,
        application_password_name: ''
      }));
    }
  }, [form.application_user_id]);
  if (!adminData && adminDataLoading) {
    return null;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Paper__WEBPACK_IMPORTED_MODULE_19__["default"], {
      sx: {
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        p: 3
      },
      elevation: 2,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)("form", {
        onSubmit: handleSubmit,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsxs)(_mui_material_Stack__WEBPACK_IMPORTED_MODULE_18__["default"], {
          spacing: 3,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Box__WEBPACK_IMPORTED_MODULE_9__["default"], {
            sx: {
              minWidth: 120
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(SimpleSelect, {
              name: "rest_api_user_id",
              label: adminOptions?.rest_api_user_id?.label || 'Rest API User',
              value: form.rest_api_user_id,
              options: users,
              defaultLabel: {
                value: 0,
                label: 'Select a user'
              },
              onChange: handleChange
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Box__WEBPACK_IMPORTED_MODULE_9__["default"], {
            sx: {
              minWidth: 120
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(SimpleSelect, {
              name: "rest_api_password_name",
              label: adminOptions?.rest_api_password_name?.label || 'Rest API Password Key',
              value: form.rest_api_password_name,
              options: restPasswordOptions,
              defaultLabel: {
                value: '',
                label: form.rest_api_user_id ? '' : 'Select a Rest API User First'
              },
              onChange: handleChange
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Divider__WEBPACK_IMPORTED_MODULE_20__["default"], {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Box__WEBPACK_IMPORTED_MODULE_9__["default"], {
            sx: {
              minWidth: 120
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(SimpleSelect, {
              name: "application_user_id",
              label: adminOptions?.application_user_id?.label || 'Application User',
              value: form.application_user_id,
              options: users,
              defaultLabel: {
                value: 0,
                label: 'Select a user'
              },
              onChange: handleChange
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Box__WEBPACK_IMPORTED_MODULE_9__["default"], {
            sx: {
              minWidth: 120
            },
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(SimpleSelect, {
              name: "application_password_name",
              label: adminOptions?.application_password_name?.label || 'Application Password Key',
              value: form.application_password_name,
              options: applicationPasswordOptions,
              defaultLabel: {
                value: '',
                label: form.application_user_id ? '' : 'Select an Application User First'
              },
              onChange: handleChange
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_TextField__WEBPACK_IMPORTED_MODULE_10__["default"], {
            label: adminData?.application_host?.label || 'Application Host',
            name: "application_host",
            value: form.application_host,
            onChange: handleChange,
            fullWidth: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_TextField__WEBPACK_IMPORTED_MODULE_10__["default"], {
            label: adminData?.application_cache_route?.label || 'Application Cache Route',
            name: "application_cache_route",
            value: form.application_cache_route,
            onChange: handleChange,
            fullWidth: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_FormControlLabel__WEBPACK_IMPORTED_MODULE_12__["default"], {
            control: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Switch__WEBPACK_IMPORTED_MODULE_11__["default"], {
              checked: form.disable_comments,
              name: "disable_comments",
              onChange: handleChange
            }),
            label: adminData?.disable_comments?.label || 'Disable Comments'
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_TextField__WEBPACK_IMPORTED_MODULE_10__["default"], {
            label: adminData?.max_upload_size?.label || 'Max Upload Size (bytes)',
            name: "max_upload_size",
            type: "number",
            value: form.max_upload_size,
            onChange: handleChange,
            fullWidth: true
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Button__WEBPACK_IMPORTED_MODULE_17__["default"], {
            type: "submit",
            variant: "contained",
            color: "primary",
            children: "Save Settings"
          })]
        })
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsxs)(_mui_material_Dialog__WEBPACK_IMPORTED_MODULE_1__["default"], {
      open: confirmOpen,
      onClose: handleCancelSave,
      "aria-labelledby": "confirm-dialog-title",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_DialogTitle__WEBPACK_IMPORTED_MODULE_2__["default"], {
        id: "confirm-dialog-title",
        children: "Confirm Save"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_DialogContent__WEBPACK_IMPORTED_MODULE_3__["default"], {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_DialogContentText__WEBPACK_IMPORTED_MODULE_4__["default"], {
          children: "Are you sure you want to save these settings?"
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsxs)(_mui_material_DialogActions__WEBPACK_IMPORTED_MODULE_5__["default"], {
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Button__WEBPACK_IMPORTED_MODULE_17__["default"], {
          onClick: handleCancelSave,
          color: "secondary",
          children: "Cancel"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Button__WEBPACK_IMPORTED_MODULE_17__["default"], {
          onClick: handleConfirmSave,
          color: "primary",
          autoFocus: true,
          children: "Confirm"
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Snackbar__WEBPACK_IMPORTED_MODULE_6__["default"], {
      open: snackbarOpen,
      autoHideDuration: 5000,
      onClose: handleSnackbarClose,
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right'
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_Alert__WEBPACK_IMPORTED_MODULE_7__["default"], {
        onClose: handleSnackbarClose,
        severity: snackbarSeverity,
        sx: {
          width: '100%'
        },
        children: snackbarMessage
      })
    })]
  });
}
function SimpleSelect({
  label,
  name,
  value,
  options,
  defaultLabel,
  onChange
}) {
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsxs)(_mui_material_FormControl__WEBPACK_IMPORTED_MODULE_13__["default"], {
    fullWidth: true,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_InputLabel__WEBPACK_IMPORTED_MODULE_14__["default"], {
      id: `${name}-label`,
      children: label
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsxs)(_mui_material_Select__WEBPACK_IMPORTED_MODULE_15__["default"], {
      labelId: `${name}-label`,
      id: name,
      name: name,
      value: value,
      label: label,
      onChange: onChange,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_MenuItem__WEBPACK_IMPORTED_MODULE_16__["default"], {
        value: defaultLabel.value,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)("em", {
          children: defaultLabel.label ? defaultLabel.label : 'None'
        })
      }), options.map((option, index) => option.value && option.label ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_22__.jsx)(_mui_material_MenuItem__WEBPACK_IMPORTED_MODULE_16__["default"], {
        value: option.value,
        children: option.label
      }, name + option.value) : null)]
    })]
  });
}

/***/ }

}]);
//# sourceMappingURL=src_App_jsx.js.map?ver=25d4f0f0619b8e6eced2