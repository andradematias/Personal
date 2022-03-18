SetFieldValue(e, t, n = !0, i = !0) {
    let r = this;
    return new Promise((a, o) => {
        if ("function" == typeof t) return console.log("Error setting field value. 'value' is an invalid type."), void a(null);
        let s = "", l = !1;
        const c = document.querySelector('[vvfieldnamewrapper="' + e + '"]');
        if (c && (s = c.getAttribute("vvfieldid")), !s) {
            const t = r.VV.FormPartition.filterFieldArray("name", e);
            t && t.length > 0 ? s = t[0].id : l = !0
        } !r.VV.FormPartition || r.VV.FormPartition.getFormEntity().clientSideGroupsAndConditions && !this.isFieldAccessible(r.VV.FormPartition.uniqueId, s) ? l = !0 : (r.VV.FormPartition.setValueObjectValueByName(e, t, !0), r.messageService.sendMessage({ uniqueId: r.VV.FormPartition.uniqueId, sender: this, var: "valueChanged", type: "SetFormControlValue", id: s, value: t, evaluateGroupConditions: n, raiseChangeEvents: i, promiseResolve: a })), l && a(null)
    })
}