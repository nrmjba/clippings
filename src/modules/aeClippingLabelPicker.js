/* -*- mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Clippings.
 *
 * The Initial Developer of the Original Code is 
 * Alex Eng <ateng@users.sourceforge.net>.
 * Portions created by the Initial Developer are Copyright (C) 2015
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK ***** */

const EXPORTED_SYMBOLS = ["aeClippingLabelPicker"];

const DEBUG = false;

const Cc = Components.classes;
const Ci = Components.interfaces;


var aeClippingLabelPicker = {
  createInstance: function (aMenupopup) {
    return new ClippingLabelPicker(aMenupopup);
 }
};


function ClippingLabelPicker(aMenupopup)
{
  this._menupopup = aMenupopup;
  this._doc = aMenupopup.ownerDocument;

  this._clippingsSvc = Cc["clippings@mozdev.org/clippings;1"].getService(Ci.aeIClippingsService);

  this._selectedLabel = this._clippingsSvc.LABEL_NONE;
  this._selectedItem = this._doc.getElementsByClassName("clipping-label-none")[0];
  this._listeners = [];

  this._labelMap = new Map();
  this._labelMap.set("clipping-label-none",   this._clippingsSvc.LABEL_NONE);
  this._labelMap.set("clipping-label-red",    this._clippingsSvc.LABEL_RED);
  this._labelMap.set("clipping-label-orange", this._clippingsSvc.LABEL_ORANGE);
  this._labelMap.set("clipping-label-yellow", this._clippingsSvc.LABEL_YELLOW);
  this._labelMap.set("clipping-label-green",  this._clippingsSvc.LABEL_GREEN);
  this._labelMap.set("clipping-label-blue",   this._clippingsSvc.LABEL_BLUE);
  this._labelMap.set("clipping-label-purple", this._clippingsSvc.LABEL_PURPLE);
  this._labelMap.set("clipping-label-grey",   this._clippingsSvc.LABEL_GREY);

  _log("aeClippingLabelPicker: initialized new instance\n_listeners = " + (this._listeners || "??") + "(typeof _listeners = " + (typeof(this._listeners)) + ")"  + "\n_doc = " + (this._doc || "??") + "\n_menupopup = " + (this._menupopup || "??"));

  this._menupopup.getElementsByClassName("clipping-label-none")[0].setAttribute("selected", "true");
}


ClippingLabelPicker.prototype = {

  get selectedItem()
  {
    return this._selectedItem;
  },


  set selectedItem(aSelectedMenuitem)
  {
    let oldSelectedItem = this._selectedItem;
    oldSelectedItem.removeAttribute("selected");

    aSelectedMenuitem.setAttribute("selected", "true");
    this._selectedItem = aSelectedMenuitem;

    let labelClass = "";
    try {
      labelClass = aSelectedMenuitem.classList[1];
    }
    catch (e) {
      throw "Exception in setter selectedItem(): Cannot get class name of selected label menu item";
    }

    let newLabel = this._labelMap.get(labelClass);
    this._selectedLabel = newLabel;

    this._listeners.forEach(function (aListener) {
      aListener.selectionChanged(newLabel);
    });
  },

  
  get selectedLabel()
  {
    return this._selectedLabel;
  },


  set selectedLabel(aLabel)
  {
    var oldSelectedMenuitem = this._selectedItem;
    oldSelectedMenuitem.removeAttribute("selected");

    var newSelectedMenuitemClass;

    for (let [key, value] of this._labelMap) {
      if (value == aLabel) {
	newSelectedMenuitemClass = key;
	break;
      }
    }

    var newSelectedMenuitem = this._menupopup.getElementsByClassName(newSelectedMenuitemClass)[0];
    newSelectedMenuitem.setAttribute("selected", "true");

    this._selectedLabel = aLabel;
    this._selectedItem = newSelectedMenuitem;

    this._listeners.forEach(function (aListener) {
      aListener.selectionChanged(aLabel);
    });
  }
};


ClippingLabelPicker.prototype.getIconFileStr = function (aLabel)
{
  var rv;

  if (aLabel) {
    rv = "clipping-" + aLabel + ".png";
  }
  else {
    rv = "clipping.png";
  }

  return rv;
};


ClippingLabelPicker.prototype.addListener = function (aNewListener)
{
  this._listeners.push(aNewListener);
  _log("aeClippingLabelPicker: Added listener object; there are now " + this._listeners.length + " listeners.");
};


ClippingLabelPicker.prototype.removeListener = function (aTargetListener)
{
  var currentListeners = this._listeners;

  this._listeners = currentListeners.filter(function (aListener) {
    return (aListener != aTargetListener);
  });

  _log("aeClippingLabelPicker: Removed listener object; there are now " + this._listeners.length + " listeners.");
};


//
// Private helper functions
//

function _log(aMessage)
{
  if (DEBUG) {
    var consoleSvc = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
    consoleSvc.logStringMessage("aeClippingLabelPicker: " + aMessage);
  }
}
