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
/* harmony import */ var _contexts_AdminDataContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contexts/AdminDataContext */ "./src/contexts/AdminDataContext.jsx");
/* harmony import */ var _mui_material_Box__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @mui/material/Box */ "./node_modules/@mui/material/esm/Box/Box.js");
/* harmony import */ var _mui_material_TextField__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @mui/material/TextField */ "./node_modules/@mui/material/esm/TextField/TextField.js");
/* harmony import */ var _mui_material_Switch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @mui/material/Switch */ "./node_modules/@mui/material/esm/Switch/Switch.js");
/* harmony import */ var _mui_material_FormControlLabel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @mui/material/FormControlLabel */ "./node_modules/@mui/material/esm/FormControlLabel/FormControlLabel.js");
/* harmony import */ var _mui_material_FormControl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @mui/material/FormControl */ "./node_modules/@mui/material/esm/FormControl/FormControl.js");
/* harmony import */ var _mui_material_InputLabel__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @mui/material/InputLabel */ "./node_modules/@mui/material/esm/InputLabel/InputLabel.js");
/* harmony import */ var _mui_material_Select__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @mui/material/Select */ "./node_modules/@mui/material/esm/Select/Select.js");
/* harmony import */ var _mui_material_MenuItem__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @mui/material/MenuItem */ "./node_modules/@mui/material/esm/MenuItem/MenuItem.js");
/* harmony import */ var _mui_material_Button__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @mui/material/Button */ "./node_modules/@mui/material/esm/Button/Button.js");
/* harmony import */ var _mui_material_Stack__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @mui/material/Stack */ "./node_modules/@mui/material/esm/Stack/Stack.js");
/* harmony import */ var _mui_material_Paper__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @mui/material/Paper */ "./node_modules/@mui/material/esm/Paper/Paper.js");
/* harmony import */ var _mui_material_Divider__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @mui/material/Divider */ "./node_modules/@mui/material/esm/Divider/Divider.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__);
















function App() {
  const adminData = (0,_contexts_AdminDataContext__WEBPACK_IMPORTED_MODULE_1__.useAdminData)();
  const [adminDataLoading, setAdminDataLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [users, setUsers] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [adminOptions, setAdminOptions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  const [form, setForm] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    rest_api_user_id: adminData?.rest_api_user_id?.value || '',
    rest_api_password_key: adminData?.rest_api_password_key?.value || '',
    application_user_id: adminData?.application_user_id?.value || '',
    application_password_key: adminData?.application_password_key?.value || '',
    application_host: adminData?.application_host?.value || '',
    application_cache_route: adminData?.application_cache_route?.value || '',
    disable_comments: !!adminData?.disable_comments?.value,
    max_upload_size: adminData?.max_upload_size?.value || ''
  });
  const restPasswordOptions = (() => {
    const selectedUser = users.find(u => u.value === form.rest_api_user_id);
    if (selectedUser && selectedUser.password_names) {
      return Object.entries(selectedUser.password_names).map(([token, name]) => ({
        value: token,
        label: name
      }));
    }
    return [];
  })();
  const applicationPasswordOptions = (() => {
    const selectedUser = users.find(u => u.value === form.application_user_id);
    if (selectedUser && selectedUser.password_names) {
      return Object.entries(selectedUser.password_names).map(([token, name]) => ({
        value: token,
        label: name
      }));
    }
    return [];
  })();
  (0,react__WEBPACK_IMPORTED_MODULE_14__.useEffect)(() => {
    if (!adminData && adminDataLoading) {
      return;
    }
    setAdminDataLoading(false);
    if (adminData && Array.isArray(adminData.users)) {
      setUsers(adminData.users);
    }
    if (adminData && adminData.admin_options) {
      setAdminOptions(adminData.admin_options);
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
    // TODO: Implement AJAX save routine
    alert('Not implemented: Save config');
  };
  if (!adminData && adminDataLoading) {
    return null;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_Paper__WEBPACK_IMPORTED_MODULE_12__["default"], {
    sx: {
      maxWidth: 600,
      mx: 'auto',
      mt: 4,
      p: 3
    },
    elevation: 2,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("form", {
      onSubmit: handleSubmit,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_mui_material_Stack__WEBPACK_IMPORTED_MODULE_11__["default"], {
        spacing: 3,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_Box__WEBPACK_IMPORTED_MODULE_2__["default"], {
          sx: {
            minWidth: 120
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(SimpleSelect, {
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
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_Box__WEBPACK_IMPORTED_MODULE_2__["default"], {
          sx: {
            minWidth: 120
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(SimpleSelect, {
            name: "rest_api_password_key",
            label: adminOptions?.rest_api_password_key?.label || 'Rest API Password Key',
            value: form.rest_api_password_key,
            options: restPasswordOptions,
            defaultLabel: {
              value: '',
              label: form.rest_api_user_id ? '' : 'Select a Rest API User First'
            },
            onChange: handleChange
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_Divider__WEBPACK_IMPORTED_MODULE_13__["default"], {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_Box__WEBPACK_IMPORTED_MODULE_2__["default"], {
          sx: {
            minWidth: 120
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(SimpleSelect, {
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
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_Box__WEBPACK_IMPORTED_MODULE_2__["default"], {
          sx: {
            minWidth: 120
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(SimpleSelect, {
            name: "application_password_key",
            label: adminOptions?.application_password_key?.label || 'Application Password Key',
            value: form.application_password_key,
            options: applicationPasswordOptions,
            defaultLabel: {
              value: '',
              label: form.application_user_id ? '' : 'Select an Application User First'
            },
            onChange: handleChange
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_TextField__WEBPACK_IMPORTED_MODULE_3__["default"], {
          label: adminData?.application_host?.label || 'Application Host',
          name: "application_host",
          value: form.application_host,
          onChange: handleChange,
          fullWidth: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_TextField__WEBPACK_IMPORTED_MODULE_3__["default"], {
          label: adminData?.application_cache_route?.label || 'Application Cache Route',
          name: "application_cache_route",
          value: form.application_cache_route,
          onChange: handleChange,
          fullWidth: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_FormControlLabel__WEBPACK_IMPORTED_MODULE_5__["default"], {
          control: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_Switch__WEBPACK_IMPORTED_MODULE_4__["default"], {
            checked: form.disable_comments,
            name: "disable_comments",
            onChange: handleChange
          }),
          label: adminData?.disable_comments?.label || 'Disable Comments'
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_TextField__WEBPACK_IMPORTED_MODULE_3__["default"], {
          label: adminData?.max_upload_size?.label || 'Max Upload Size (bytes)',
          name: "max_upload_size",
          type: "number",
          value: form.max_upload_size,
          onChange: handleChange,
          fullWidth: true
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_Button__WEBPACK_IMPORTED_MODULE_10__["default"], {
          type: "submit",
          variant: "contained",
          color: "primary",
          children: "Save Settings"
        })]
      })
    })
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
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_mui_material_FormControl__WEBPACK_IMPORTED_MODULE_6__["default"], {
    fullWidth: true,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_InputLabel__WEBPACK_IMPORTED_MODULE_7__["default"], {
      id: `${name}-label`,
      children: label
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsxs)(_mui_material_Select__WEBPACK_IMPORTED_MODULE_8__["default"], {
      labelId: `${name}-label`,
      id: name,
      name: name,
      value: value,
      label: label,
      onChange: onChange,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_MenuItem__WEBPACK_IMPORTED_MODULE_9__["default"], {
        value: defaultLabel.value,
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("em", {
          children: defaultLabel.label ? defaultLabel.label : 'None'
        })
      }), options.map((option, index) => option.value && option.label ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_mui_material_MenuItem__WEBPACK_IMPORTED_MODULE_9__["default"], {
        value: option.value,
        children: option.label
      }, name + option.value) : null)]
    })]
  });
}

/***/ }

}]);
//# sourceMappingURL=src_App_jsx.js.map?ver=89c79d162bfef2d930d8