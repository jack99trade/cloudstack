(function(cloudStack, testData) {

  cloudStack.sections.templates = {
    title: 'Templates',
    id: 'templates',
    sectionSelect: {
      label: 'Select view'
    },
    sections: {
      templates: {
        type: 'select',
        title: 'Templates',
        listView: {
          id: 'templates',
          label: 'Templates',          
          filters: {            
            featured: { label: 'Featured' },
            community: { label: 'Community' },
            mine: { label: 'Mine' }
          },          
          fields: {
            name: { label: 'Name' },
            id: { label: 'ID' },
            zonename: { label: 'Zone' },
            hypervisor: { label: 'Hypervisor' }
          },
          actions: {
            add: {
              label: 'Create template',

              messages: {
                confirm: function(args) {
                  return 'Are you sure you want to create a template?';
                },
                success: function(args) {
                  return 'Your new template is being created.';
                },
                notification: function(args) {
                  return 'Creating new template';
                },
                complete: function(args) {
                  return 'Template has been created successfully!';
                }
              },

              createForm: {
                title: 'Create template',
                desc: 'Please fill in the following data to create a new template.',
                preFilter: cloudStack.preFilter.createTemplate,
                fields: {
                  name: {
                    label: 'Name',
                    validation: { required: true }
                  },
                  description: {
                    label: 'Description',
                    validation: { required: true }
                  },
                  url: {
                    label: 'URL',
                    validation: { required: true }
                  },
                  zone: {
                    label: 'Zone',
                    select: function(args) {
                      $.ajax({
                        url: createURL("listZones&available=true"),
                        dataType: "json",
                        async: true,
                        success: function(json) {
                          var zoneObjs = json.listzonesresponse.zone;
                          var items = [];
                          if (isAdmin() && !(cloudStack.context.projects &&
                                             cloudStack.context.projects[0]))
                            items.push({id: -1, description: "All Zones"});
                          $(zoneObjs).each(function() {
                            items.push({id: this.id, description: this.name});
                          });
                          args.response.success({data: items});
                        }
                      });
                    }
                  },
                  hypervisor: {
                    label: 'Hypervisor',
                    dependsOn: 'zone',
                    select: function(args) {
                      if(args.zone == null)
                        return;

                      var apiCmd;
                      if(args.zone == -1)
                        apiCmd = "listHypervisors&zoneid=-1";
                      else
                        apiCmd = "listHypervisors&zoneid=" + args.zone;

                      $.ajax({
                        url: createURL(apiCmd),
                        dataType: "json",
                        async: false,
                        success: function(json) {
                          var hypervisorObjs = json.listhypervisorsresponse.hypervisor;
                          var items = [];
                          $(hypervisorObjs).each(function(){
                            items.push({id: this.name, description: this.name});
                          });
                          args.response.success({data: items});
                        }
                      });
                      
                      args.$select.change(function() {
                        var $form = $(this).closest('form');                        
                        if($(this).val() == "VMware") {
                          $form.find('.form-item[rel=rootDiskControllerType]').css('display', 'inline-block');
                          $form.find('.form-item[rel=nicAdapterType]').css('display', 'inline-block');
                          $form.find('.form-item[rel=keyboardType]').css('display', 'inline-block');
                        }
                        else {
                          $form.find('.form-item[rel=rootDiskControllerType]').hide();
                          $form.find('.form-item[rel=nicAdapterType]').hide();
                          $form.find('.form-item[rel=keyboardType]').hide();
                        }                        
                      });                      
                    }
                  },
                  
                  //fields for hypervisor == "VMware" (starts here)
                  rootDiskControllerType: {
                    label: 'Root disk controller',
                    isHidden: true,
                    select: function(args) {
                      var items = []
                      items.push({id: "", description: ""});
                      items.push({id: "scsi", description: "scsi"});
                      items.push({id: "ide", description: "ide"});
                      args.response.success({data: items});
                    }
                  },
                  nicAdapterType: {
                    label: 'NIC adapter type',
                    isHidden: true,
                    select: function(args) {
                      var items = []
                      items.push({id: "", description: ""});
                      items.push({id: "E1000", description: "E1000"});
                      items.push({id: "PCNet32", description: "PCNet32"});
                      items.push({id: "Vmxnet2", description: "Vmxnet2"});
                      items.push({id: "Vmxnet3", description: "Vmxnet3"});
                      args.response.success({data: items});
                    }
                  },
                  keyboardType: {
                    label: 'Keyboard type',
                    isHidden: true,
                    select: function(args) {
                      var items = []
                      items.push({id: "", description: ""});
                      items.push({id: "us", description: "US"});  
                      items.push({id: "jp", description: "Japanese"});                                         
                      args.response.success({data: items});
                    }
                  },
                  //fields for hypervisor == "VMware" (ends here)
                  
                  format: {
                    label: 'Format',
                    dependsOn: 'hypervisor',
                    select: function(args) {
                      var items = [];
                      if(args.hypervisor == "XenServer") {
                        //formatSelect.append("<option value='VHD'>VHD</option>");
                        items.push({id:'VHD', description: 'VHD'});
                      }
                      else if(args.hypervisor == "VMware") {
                        //formatSelect.append("<option value='OVA'>OVA</option>");
                        items.push({id:'OVA', description: 'OVA'});
                      }
                      else if(args.hypervisor == "KVM") {
                        //formatSelect.append("<option value='QCOW2'>QCOW2</option>");
                        items.push({id:'QCOW2', description: 'QCOW2'});
                      }
                      else if(args.hypervisor == "BareMetal") {
                        //formatSelect.append("<option value='BareMetal'>BareMetal</option>");
                        items.push({id:'BareMetal', description: 'BareMetal'});
                      }
                      else if(args.hypervisor == "Ovm") {
                        //formatSelect.append("<option value='RAW'>RAW</option>");
                        items.push({id:'RAW', description: 'RAW'});
                      }
                      args.response.success({data: items});
                    }
                  },

                  osTypeId: {
                    label: 'OS Type',
                    select: function(args) {
                      $.ajax({
                        url: createURL("listOsTypes"),
                        dataType: "json",
                        async: true,
                        success: function(json) {
                          var items = json.listostypesresponse.ostype;
                          args.response.success({data: items});
                        }
                      });
                    }
                  },

                  isExtractable: {
                    label: "Extractable",
                    isBoolean: true
                  },

                  isPasswordEnabled: {
                    label: "Password Enabled",
                    isBoolean: true
                  },

                  isPublic: {
                    label: "Public",
                    isBoolean: true,
                    isHidden: true
                  },

                  isFeatured: {
                    label: "Featured",
                    isBoolean: true,
                    isHidden: true
                  }
                }
              },

              action: function(args) {
                var array1 = [];
                array1.push("&name=" + todb(args.data.name));
                array1.push("&displayText=" + todb(args.data.description));
                array1.push("&url=" + todb(args.data.url));
                array1.push("&zoneid=" + args.data.zone);
                array1.push("&format=" + args.data.format);
                array1.push("&isextractable=" + (args.data.isExtractable=="on"));
                array1.push("&passwordEnabled=" + (args.data.isPasswordEnabled=="on"));
                array1.push("&osTypeId=" + args.data.osTypeId);
                array1.push("&hypervisor=" + args.data.hypervisor);

                if(args.$form.find('.form-item[rel=isPublic]').css("display") != "none")
                  array1.push("&ispublic=" + (args.data.isPublic == "on"));
                if(args.$form.find('.form-item[rel=isFeatured]').css("display") != "none")
                  array1.push("&isfeatured=" + (args.data.isFeatured == "on"));

                //VMware only (starts here)
                if(args.$form.find('.form-item[rel=rootDiskControllerType]').css("display") != "none" && args.data.rootDiskControllerType != "")
                  array1.push("&details[0].rootDiskController=" + args.data.rootDiskControllerType);                    
                if(args.$form.find('.form-item[rel=nicAdapterType]').css("display") != "none" && args.data.nicAdapterType != "")
                  array1.push("&details[0].nicAdapter=" + args.data.nicAdapterType);                    
                if(args.$form.find('.form-item[rel=keyboardType]').css("display") != "none" && args.data.keyboardType != "")
                  array1.push("&details[0].keyboard=" + args.data.keyboardType);  
                //VMware only (ends here)
                
                $.ajax({
                  url: createURL("registerTemplate" + array1.join("")),
                  dataType: "json",
                  success: function(json) {
                    var items = json.registertemplateresponse.template;  //items might have more than one array element if it's create templates for all zones.
                    args.response.success({data:items[0]});
                    /*
                     if(items.length > 1) {
                     for(var i=1; i<items.length; i++) {
                     var $midmenuItem2 = $("#midmenu_item").clone();
                     templateToMidmenu(items[i], $midmenuItem2);
                     bindClickToMidMenu($midmenuItem2, templateToRightPanel, templateGetMidmenuId);
                     $("#midmenu_container").append($midmenuItem2.show());
                     }
                     }
                     */
                  },
                  error: function(XMLHttpResponse) {
                    var errorMsg = parseXMLHttpResponse(XMLHttpResponse);
                    args.response.error(errorMsg);
                  }
                });
              },

              notification: {
                poll: function(args) {
                  args.complete();
                }
              }
            },

            copyTemplate: {
              label: 'Copy template',
              messages: {
                confirm: function(args) {
                  return 'Are you sure you want to copy template?';
                },
                success: function(args) {
                  return 'Template is being copied.';
                },
                notification: function(args) {
                  return 'Copying template';
                },
                complete: function(args) {
                  return 'Template has been copied.';
                }
              },
              createForm: {
                title: 'Copy template',
                desc: 'Please select a zone for your new template to be stored',
                fields: {
                  destinationZoneId: {
                    label: 'Destination zone',
                    select: function(args) {
                      $.ajax({
                        url: createURL("listZones&available=true"),
                        dataType: "json",
                        async: true,
                        success: function(json) {
                          args.response.success({
                            data: $.map(json.listzonesresponse.zone, function(zone) {
                              return {
                                id: zone.id,
                                description: zone.name
                              };
                            })
                          });
                        }
                      });
                    }
                  }
                }
              },
              action: function(args) {
                $.ajax({
                  url: createURL("copyTemplate&id=" + args.context.templates[0].id + "&sourcezoneid=" + args.context.templates[0].zoneid + "&destzoneid=" + args.data.destinationZoneId),
                  dataType: "json",
                  async: true,
                  success: function(json) {
                    var jid = json.copytemplateresponse.jobid;
                    args.response.success(
                      {_custom:
                       {jobId: jid,
                        getUpdatedItem: function(json) {
                          return {}; //nothing in this template needs to be updated
                        },
                        getActionFilter: function() {
                          return templateActionfilter;
                        }
                       }
                      }
                    );
                  }
                });
              },
              notification: {
                poll: pollAsyncJobResult
              }
            },

            downloadTemplate: {
              label: 'Download template',
              messages: {
                confirm: function(args) {
                  return 'Are you sure you want to download template ?';
                },
                success: function(args) {
                  return 'Template is being downloaded.';
                },
                notification: function(args) {
                  return 'Downloading template';
                },
                complete: function(args) {
                  var url = decodeURIComponent(args.url);
                  var htmlMsg = 'Please click <a href="#">00000</a> to download template';
                  var htmlMsg2 = htmlMsg.replace(/#/, url).replace(/00000/, url);
                  return htmlMsg2;
                }
              },
              action: function(args) {
                $.ajax({
                  url: createURL("extractTemplate&id=" + args.context.templates[0].id + "&zoneid=" + args.context.templates[0].zoneid + "&mode=HTTP_DOWNLOAD"),
                  dataType: "json",
                  async: true,
                  success: function(json) {
                    var jid = json.extracttemplateresponse.jobid;
                    args.response.success(
                      {_custom:
                       {jobId: jid,
                        getUpdatedItem: function(json) {
                          return json.queryasyncjobresultresponse.jobresult.iso;
                        },
                        getActionFilter: function() {
                          return templateActionfilter;
                        }
                       }
                      }
                    );
                  }
                });
              },
              notification: {
                poll: pollAsyncJobResult
              }
            },

            'delete': {
              label: 'Delete template',
              messages: {
                confirm: function(args) {
                  return 'Are you sure you want to delete template ?';
                },
                success: function(args) {
                  return 'template is being deleted.';
                },
                notification: function(args) {
                  return 'Deleting template';
                },
                complete: function(args) {
                  return 'template has been deleted.';
                }
              },
              action: function(args) {
                var array1 = [];
                if (args.context.templates[0].zoneid != null)
                  array1.push("&zoneid=" + args.context.templates[0].zoneid);

                $.ajax({
                  url: createURL("deleteTemplate&id=" + args.context.templates[0].id + array1.join("")),
                  dataType: "json",
                  async: true,
                  success: function(json) {
                    var jid = json.deletetemplateresponse.jobid;
                    args.response.success(
                      {_custom:
                       {jobId: jid,
                        getUpdatedItem: function(json) {
                          return {}; //nothing in this template needs to be updated, in fact, this whole template has being deleted
                        },
                        getActionFilter: function() {
                          return templateActionfilter;
                        }
                       }
                      }
                    );
                  }
                });
              },
              notification: {
                poll: pollAsyncJobResult
              }
            }

          },

          dataProvider: function(args) {        	
        	  var array1 = [];          	
            if(args.filterBy != null) {
              if(args.filterBy.kind != null) {
                switch(args.filterBy.kind) {   
                case "featured":
                  array1.push("&templatefilter=featured");
                  break;
                case "community":
                  array1.push("&templatefilter=community");
                  break;   
                case "mine":
                  array1.push("&templatefilter=self");
                  break;                  
                }
              }
              if(args.filterBy.search != null && args.filterBy.search.by != null && args.filterBy.search.value != null) {
                switch(args.filterBy.search.by) {
                case "name":
                  array1.push("&keyword=" + args.filterBy.search.value);
                  break;
                }
              }
            }                	  
            $.ajax({
              url: createURL("listTemplates&page=" + args.page + "&pagesize=" + pageSize + array1.join("")),
              dataType: "json",
              async: true,
              success: function(json) {
                var items = json.listtemplatesresponse.template;
                args.response.success({
                  actionFilter: templateActionfilter,
                  data: items
                });
              }
            });
          }	,

          detailView: {
            name: 'Template details',
            actions: {
              edit: {
                label: 'Edit',
                action: function(args) {
                  var array1 = [];
                  array1.push("&name=" + todb(args.data.name));
                  array1.push("&displaytext=" + todb(args.data.displaytext));
                  array1.push("&ostypeid=" + args.data.ostypeid);                  
                  array1.push("&passwordenabled=" + (args.data.passwordenabled=="on"));	                                                                      
                  $.ajax({
                    url: createURL("updateTemplate&id=" + args.context.templates[0].id + "&zoneid=" + args.context.templates[0].zoneid + array1.join("")),
                    dataType: "json",
                    async: false,
                    success: function(json) {    
                      //API returns an incomplete embedded object  (some properties are missing in the embedded template object)                   
                    }
                  });
                                                      
                  var array2 = [];
                  array2.push("&ispublic=" + (args.data.ispublic=="on"));                           
                  array2.push("&isfeatured=" + (args.data.isfeatured=="on"));	
                  array2.push("&isextractable=" + (args.data.isextractable=="on"));	                                          
                  $.ajax({
                    url: createURL("updateTemplatePermissions&id=" + args.context.templates[0].id + "&zoneid=" + args.context.templates[0].zoneid + array2.join("")),
                    dataType: "json",
                    async: false,
                    success: function(json) {   
                      //API doesn't return an embedded object                    
                    }
                  });
                  
                  //So, we call listTemplates API to get a complete template object
                  $.ajax({                  
                    url: createURL("listTemplates&id=" + args.context.templates[0].id + "&zoneid=" + args.context.templates[0].zoneid + "&templatefilter=self"),
                    dataType: "json",
                    async: false,
                    success: function(json){            
                      var item = json.listtemplatesresponse.template;
                      args.response.success({data: item});
                    }
                  });                  
                }
              },

              copyTemplate: {
                label: 'Copy template',
                messages: {
                  confirm: function(args) {
                    return 'Are you sure you want to copy template?';
                  },
                  success: function(args) {
                    return 'Template is being copied.';
                  },
                  notification: function(args) {
                    return 'Copying template';
                  },
                  complete: function(args) {
                    return 'Template has been copied.';
                  }
                },
                createForm: {
                  title: 'Copy template',
                  desc: '',
                  fields: {
                    destinationZoneId: {
                      label: 'Destination zone',
                      select: function(args) {
                        $.ajax({
                          url: createURL("listZones&available=true"),
                          dataType: "json",
                          async: true,
                          success: function(json) {
                            var zoneObjs = json.listzonesresponse.zone;
                            var items = [];
                            $(zoneObjs).each(function() {
                              if(this.id != args.context.templates[0].zoneid)
                                items.push({id: this.id, description: this.name});
                            });
                            args.response.success({data: items});
                          }
                        });
                      }
                    }
                  }
                },
                action: function(args) {
                  $.ajax({
                    url: createURL("copyTemplate&id=" + args.context.templates[0].id + "&sourcezoneid=" + args.context.templates[0].zoneid + "&destzoneid=" + args.data.destinationZoneId),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      var jid = json.copytemplateresponse.jobid;
                      args.response.success(
                        {_custom:
                         {jobId: jid,
                          getUpdatedItem: function(json) {
                            return {}; //nothing in this template needs to be updated
                          },
                          getActionFilter: function() {
                            return templateActionfilter;
                          }
                         }
                        }
                      );
                    }
                  });
                },
                notification: {
                  poll: pollAsyncJobResult
                }
              },

              downloadTemplate: {
                label: 'Download template',
                messages: {
                  confirm: function(args) {
                    return 'Are you sure you want to download template ?';
                  },
                  success: function(args) {
                    return 'Template is being downloaded.';
                  },
                  notification: function(args) {
                    return 'Downloading template';
                  },
                  complete: function(args) {
                    var url = decodeURIComponent(args.url);
                    var htmlMsg = 'Please click <a href="#">00000</a> to download template';
                    var htmlMsg2 = htmlMsg.replace(/#/, url).replace(/00000/, url);
                    return htmlMsg2;
                  }
                },
                action: function(args) {
                  $.ajax({
                    url: createURL("extractTemplate&id=" + args.context.templates[0].id + "&zoneid=" + args.context.templates[0].zoneid + "&mode=HTTP_DOWNLOAD"),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      var jid = json.extracttemplateresponse.jobid;
                      args.response.success(
                        {_custom:
                         {jobId: jid,
                          getUpdatedItem: function(json) {
                            return json.queryasyncjobresultresponse.jobresult.template;
                          },
                          getActionFilter: function() {
                            return templateActionfilter;
                          }
                         }
                        }
                      );
                    }
                  });
                },
                notification: {
                  poll: pollAsyncJobResult
                }
              },

              'delete': {
                label: 'Delete template',
                messages: {
                  confirm: function(args) {
                    return 'Are you sure you want to delete template ?';
                  },
                  success: function(args) {
                    return 'template is being deleted.';
                  },
                  notification: function(args) {
                    return 'Deleting template';
                  },
                  complete: function(args) {
                    return 'template has been deleted.';
                  }
                },
                action: function(args) {
                  var array1 = [];
                  if (args.context.templates[0].zoneid != null)
                    array1.push("&zoneid=" + args.context.templates[0].zoneid);

                  $.ajax({
                    url: createURL("deleteTemplate&id=" + args.context.templates[0].id + array1.join("")),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      var jid = json.deletetemplateresponse.jobid;
                      args.response.success(
                        {_custom:
                         {jobId: jid,
                          getUpdatedItem: function(json) {
                            return {}; //nothing in this template needs to be updated, in fact, this whole template has being deleted
                          },
                          getActionFilter: function() {
                            return templateActionfilter;
                          }
                         }
                        }
                      );
                    }
                  });
                },
                notification: {
                  poll: pollAsyncJobResult
                }
              }

            },
            tabs: {
              details: {
                title: 'Template Details',

                /*
                 preFilter: function(args) {
                 if(isAdmin()) {
                 args.$form.find('.form-item[rel=storage]').css('display', 'inline-block');
                 }
                 else {
                 args.$form.find('.form-item[rel=storage]').hide();
                 }
                 },
                 */

                fields: [
                  {
                    name: {
                      label: 'Name',
                      isEditable: true
                    }
                  },
                  {
                    id: { label: 'ID' },
                    zonename: { label: 'Zone name' },
                    zoneid: { label: 'Zone ID' },
                    displaytext: {
                      label: 'Description',
                      isEditable: true
                    },
                    hypervisor: { label: 'Hypervisor' },
                    templatetype: { label: 'Template Type' },
                    isready: { label: 'Ready', converter:cloudStack.converters.toBooleanText },
                    status: { label: 'Status' },
                    size : {
                      label: 'Size',
                      converter: function(args) {
                        if (args == null || args == 0)
                          return "";
                        else
                          return cloudStack.converters.convertBytes(args);
                      }
                    },
                    isextractable: {
                      label: 'Extractable',
                      isBoolean: true,
                      isEditable: true,  
                      converter:cloudStack.converters.toBooleanText
                    },
                    passwordenabled: {
                      label: 'Password Enabled',
                      isBoolean: true,
                      isEditable: true,  
                      converter:cloudStack.converters.toBooleanText
                    },
                    ispublic: {
                      label: 'Public',
                      isBoolean: true,
                      isEditable: true, 
                      converter:cloudStack.converters.toBooleanText
                    },
                    isfeatured: {
                      label: 'Featured',
                      isBoolean: true,
                      isEditable: true,  
                      converter:cloudStack.converters.toBooleanText
                    },
                    crossZones: {
                      label: 'Cross Zones',
                      converter:cloudStack.converters.toBooleanText
                    },

                    ostypeid: {
                      label: 'OS Type',
                      isEditable: true,
                      select: function(args) {
                        $.ajax({
                          url: createURL("listOsTypes"),
                          dataType: "json",
                          async: true,
                          success: function(json) {
                            var ostypes = json.listostypesresponse.ostype;
                            var items = [];
                            $(ostypes).each(function() {
                              items.push({id: this.id, description: this.description});
                            });
                            args.response.success({data: items});
                          }
                        });
                      }
                    },

                    domain: { label: 'Domain' },
                    account: { label: 'Account' },
                    created: { label: 'Created' }
                  }
                ],

                dataProvider: function(args) {
                  args.response.success(
                    {
                      actionFilter: templateActionfilter,
                      data:args.context.templates[0]
                    }
                  );
                }
              }
            }
          }
        }
      },
      isos: {
        type: 'select',
        title: 'ISOs',
        listView: {
          label: 'ISOs',
          filters: {            
            featured: { label: 'Featured' },
            community: { label: 'Community' },
            mine: { label: 'Mine' }
          },      
          fields: {
            displaytext: { label: 'Name' },
            id: { label: 'ID' },
            size: { label: 'Size' },
            zonename: { label: 'Zone' }
          },
          actions: {
            add: {
              label: 'Create ISO',

              messages: {
                confirm: function(args) {
                  return 'Are you sure you want to create a ISO?';
                },
                success: function(args) {
                  return 'Your new ISO is being created.';
                },
                notification: function(args) {
                  return 'Creating new ISO';
                },
                complete: function(args) {
                  return 'ISO has been created successfully!';
                }
              },

              createForm: {
                title: 'Create ISO',
                desc: 'Please fill in the following data to create a new ISO.',
                preFilter: cloudStack.preFilter.createTemplate,
                fields: {
                  name: {
                    label: 'Name',
                    validation: { required: true }
                  },
                  description: {
                    label: 'Description',
                    validation: { required: true }
                  },
                  url: {
                    label: 'URL',
                    validation: { required: true }
                  },
                  zone: {
                    label: 'Zone',
                    select: function(args) {
                      $.ajax({
                        url: createURL("listZones&available=true"),
                        dataType: "json",
                        async: true,
                        success: function(json) {
                          var zoneObjs = json.listzonesresponse.zone;
                          var items = [];
                          if (isAdmin() && !(cloudStack.context.projects &&
                                              cloudStack.context.projects[0]))
                            items.push({id: -1, description: "All Zones"});
                          $(zoneObjs).each(function() {
                            items.push({id: this.id, description: this.name});
                          });
                          args.response.success({data: items});
                        }
                      });
                    }
                  },

                  isBootable: {
                    label: "Bootable",
                    isBoolean: true
                  },

                  osTypeId: {
                    label: 'OS Type',
                    dependsOn: 'isBootable',
                    isHidden: true,
                    validation: { required: true },
                    select: function(args) {
                      $.ajax({
                        url: createURL("listOsTypes"),
                        dataType: "json",
                        async: true,
                        success: function(json) {
                          var osTypeObjs = json.listostypesresponse.ostype;
                          var items = [];
                          //items.push({id: "", description: "None"}); //shouldn't have None option when bootable is checked
                          $(osTypeObjs).each(function(){
                            items.push({id: this.id, description: this.description});
                          });
                          args.response.success({data: items});
                        }
                      });
                    }
                  },

                  isExtractable: {
                    label: "Extractable",
                    isBoolean: true
                  },

                  isPublic: {
                    label: "Public",
                    isBoolean: true,
                    isHidden: true
                  },

                  isFeatured: {
                    label: "Featured",
                    isBoolean: true,
                    isHidden: true
                  }
                }
              },

              action: function(args) {
                var array1 = [];
                array1.push("&name=" + todb(args.data.name));
                array1.push("&displayText=" + todb(args.data.description));
                array1.push("&url=" + todb(args.data.url));
                array1.push("&zoneid=" + args.data.zone);
                array1.push("&isextractable=" + (args.data.isExtractable=="on"));
                array1.push("&bootable=" + (args.data.isBootable=="on"));

                if(args.$form.find('.form-item[rel=osTypeId]').css("display") != "none")
                  array1.push("&osTypeId=" + args.data.osTypeId);

                if(args.$form.find('.form-item[rel=isPublic]').css("display") != "none")
                  array1.push("&ispublic=" + (args.data.isPublic == "on"));
                if(args.$form.find('.form-item[rel=isFeatured]').css("display") != "none")
                  array1.push("&isfeatured=" + (args.data.isFeatured == "on"));

                $.ajax({
                  url: createURL("registerIso" + array1.join("")),
                  dataType: "json",
                  success: function(json) {
                    var items = json.registerisoresponse.iso;	//items might have more than one array element if it's create ISOs for all zones.
                    args.response.success({data:items[0]});

                    /*
                     if(items.length > 1) {
                     for(var i=1; i<items.length; i++) {
                     var $midmenuItem2 = $("#midmenu_item").clone();
                     ISOToMidmenu(items[i], $midmenuItem2);
                     bindClickToMidMenu($midmenuItem2, templateToRightPanel, ISOGetMidmenuId);
                     $("#midmenu_container").append($midmenuItem2.show());              }
                     }
                     */
                  },
                  error: function(XMLHttpResponse) {
                    var errorMsg = parseXMLHttpResponse(XMLHttpResponse);
                    args.response.error(errorMsg);
                  }
                });
              },

              notification: {
                poll: function(args) {
                  args.complete();
                }
              }
            },

            copyISO: {
              label: 'Copy ISO',
              messages: {
                confirm: function(args) {
                  return 'Are you sure you want to copy ISO?';
                },
                success: function(args) {
                  return 'ISO is being copied.';
                },
                notification: function(args) {
                  return 'Copying ISO';
                },
                complete: function(args) {
                  return 'ISO has been copied.';
                }
              },
              createForm: {
                title: 'Copy ISO',
                desc: '',
                fields: {
                  destinationZoneId: {
                    label: 'Destination zone',
                    select: function(args) {
                      $.ajax({
                        url: createURL("listZones&available=true"),
                        dataType: "json",
                        async: true,
                        success: function(json) {
                          var zoneObjs = json.listzonesresponse.zone;
                          var items = [];
                          $(zoneObjs).each(function() {
                            if(this.id != args.context.isos[0].zoneid)
                              items.push({id: this.id, description: this.name});
                          });
                          args.response.success({data: items});
                        }
                      });
                    }
                  }
                }
              },
              action: function(args) {
                $.ajax({
                  url: createURL("copyIso&id=" + args.context.isos[0].id + "&sourcezoneid=" + args.context.isos[0].zoneid + "&destzoneid=" + args.data.destinationZoneId),
                  dataType: "json",
                  async: true,
                  success: function(json) {
                    var jid = json.copytemplateresponse.jobid;
                    args.response.success(
                      {_custom:
                       {jobId: jid,
                        getUpdatedItem: function(json) {
                          return {}; //nothing in this ISO needs to be updated
                        },
                        getActionFilter: function() {
                          return isoActionfilter;
                        }
                       }
                      }
                    );
                  }
                });
              },
              notification: {
                poll: pollAsyncJobResult
              }
            },

            downloadISO: {
              label: 'Download ISO',
              messages: {
                confirm: function(args) {
                  return 'Are you sure you want to download ISO ?';
                },
                success: function(args) {
                  return 'ISO is being downloaded.';
                },
                notification: function(args) {
                  return 'Downloading ISO';
                },
                complete: function(args) {
                  var url = decodeURIComponent(args.url);
                  var htmlMsg = 'Please click <a href="#">00000</a> to download ISO';
                  var htmlMsg2 = htmlMsg.replace(/#/, url).replace(/00000/, url);
                  return htmlMsg2;
                }
              },
              action: function(args) {
                $.ajax({
                  url: createURL("extractIso&id=" + args.context.isos[0].id + "&zoneid=" + args.context.isos[0].zoneid + "&mode=HTTP_DOWNLOAD"),
                  dataType: "json",
                  async: true,
                  success: function(json) {
                    var jid = json.extractisoresponse.jobid;
                    args.response.success(
                      {_custom:
                       {jobId: jid,
                        getUpdatedItem: function(json) {
                          return json.queryasyncjobresultresponse.jobresult.iso;
                        },
                        getActionFilter: function() {
                          return isoActionfilter;
                        }
                       }
                      }
                    );
                  }
                });
              },
              notification: {
                poll: pollAsyncJobResult
              }
            },

            'delete': {
              label: 'Delete ISO',
              messages: {
                confirm: function(args) {
                  return 'Are you sure you want to delete ISO ?';
                },
                success: function(args) {
                  return 'ISO is being deleted.';
                },
                notification: function(args) {
                  return 'Deleting ISO';
                },
                complete: function(args) {
                  return 'ISO has been deleted.';
                }
              },
              action: function(args) {
                var array1 = [];
                if (args.context.isos[0].zoneid != null)
                  array1.push("&zoneid=" + args.context.isos[0].zoneid);

                $.ajax({
                  url: createURL("deleteIso&id=" + args.context.isos[0].id + array1.join("")),
                  dataType: "json",
                  async: true,
                  success: function(json) {
                    var jid = json.deleteisosresponse.jobid;
                    args.response.success(
                      {_custom:
                       {jobId: jid,
                        getUpdatedItem: function(json) {
                          return {}; //nothing in this ISO needs to be updated, in fact, this whole ISO has being deleted
                        },
                        getActionFilter: function() {
                          return isoActionfilter;
                        }
                       }
                      }
                    );
                  }
                });
              },
              notification: {
                poll: pollAsyncJobResult
              }
            }

          },

          dataProvider: function(args) {           
            var array1 = [];          	
            if(args.filterBy != null) {
              if(args.filterBy.kind != null) {
                switch(args.filterBy.kind) {   
                case "featured":
                  array1.push("&isofilter=featured");
                  break;
                case "community":
                  array1.push("&isofilter=community");
                  break;    
                case "mine":
                  array1.push("&isofilter=self");
                  break;                  
                }
              }
              if(args.filterBy.search != null && args.filterBy.search.by != null && args.filterBy.search.value != null) {
                switch(args.filterBy.search.by) {
                case "name":
                  array1.push("&keyword=" + args.filterBy.search.value);
                  break;
                }
              }
            }                
                      
            $.ajax({
              url: createURL("listIsos&page=" + args.page + "&pagesize=" + pageSize + array1.join("")),
              dataType: "json",
              async: true,
              success: function(json) {
                var items = json.listisosresponse.iso;
                args.response.success({
                  actionFilter: isoActionfilter,
                  data: items
                });
              }
            });
          },

          detailView: {
            name: 'ISO details',
            actions: {
              edit: {
                label: 'Edit',
                action: function(args) {
                  var array1 = [];
                  array1.push("&name=" + todb(args.data.name));
                  array1.push("&displaytext=" + todb(args.data.displaytext));
                  array1.push("&ostypeid=" + args.data.ostypeid);
                  $.ajax({
                    url: createURL("updateIso&id=" + args.context.isos[0].id + "&zoneid=" + args.context.isos[0].zoneid + array1.join("")),
                    dataType: "json",
                    async: false,
                    success: function(json) {
                      //updateIso API returns an incomplete ISO object (isextractable and isfeatured are missing)              
                    }
                  });
                                   
                  var array2 = [];
                  array2.push("&ispublic=" + (args.data.ispublic=="on"));                           
                  array2.push("&isfeatured=" + (args.data.isfeatured=="on"));	
                  array2.push("&isextractable=" + (args.data.isextractable=="on"));	  
                  $.ajax({
                    url: createURL("updateIsoPermissions&id=" + args.context.isos[0].id + "&zoneid=" + args.context.isos[0].zoneid + array2.join("")),
                    dataType: "json",
                    async: false,
                    success: function(json) {   
                      //updateIsoPermissions API doesn't return ISO object             
                    }
                  });
                  
                  //So, we call listIsos API to get a complete ISO object
                  $.ajax({                  
                    url: createURL("listIsos&id=" + args.context.isos[0].id + "&zoneid=" + args.context.isos[0].zoneid + "&isofilter=self"),
                    dataType: "json",
                    async: false,
                    success: function(json){  
                      var item = json.listisosresponse.iso;
                      args.response.success({data: item});
                    }
                  });    
                }
              },

              copyISO: {
                label: 'Copy ISO',
                messages: {
                  confirm: function(args) {
                    return 'Are you sure you want to copy ISO?';
                  },
                  success: function(args) {
                    return 'ISO is being copied.';
                  },
                  notification: function(args) {
                    return 'Copying ISO';
                  },
                  complete: function(args) {
                    return 'ISO has been copied.';
                  }
                },
                createForm: {
                  title: 'Copy ISO',
                  desc: '',
                  fields: {
                    destinationZoneId: {
                      label: 'Destination zone',
                      select: function(args) {
                        $.ajax({
                          url: createURL("listZones&available=true"),
                          dataType: "json",
                          async: true,
                          success: function(json) {
                            var zoneObjs = json.listzonesresponse.zone;
                            var items = [];
                            $(zoneObjs).each(function() {
                              if(this.id != args.context.isos[0].zoneid)
                                items.push({id: this.id, description: this.name});
                            });
                            args.response.success({data: items});
                          }
                        });
                      }
                    }
                  }
                },
                action: function(args) {
                  $.ajax({
                    url: createURL("copyIso&id=" + args.context.isos[0].id + "&sourcezoneid=" + args.context.isos[0].zoneid + "&destzoneid=" + args.data.destinationZoneId),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      var jid = json.copytemplateresponse.jobid;
                      args.response.success(
                        {_custom:
                         {jobId: jid,
                          getUpdatedItem: function(json) {
                            return {}; //nothing in this ISO needs to be updated
                          },
                          getActionFilter: function() {
                            return isoActionfilter;
                          }
                         }
                        }
                      );
                    }
                  });
                },
                notification: {
                  poll: pollAsyncJobResult
                }
              },

              downloadISO: {
                label: 'Download ISO',
                messages: {
                  confirm: function(args) {
                    return 'Are you sure you want to download ISO ?';
                  },
                  success: function(args) {
                    return 'ISO is being downloaded.';
                  },
                  notification: function(args) {
                    return 'Downloading ISO';
                  },
                  complete: function(args) {
                    var url = decodeURIComponent(args.url);
                    var htmlMsg = 'Please click <a href="#">00000</a> to download ISO';
                    var htmlMsg2 = htmlMsg.replace(/#/, url).replace(/00000/, url);
                    return htmlMsg2;
                  }
                },
                action: function(args) {
                  $.ajax({
                    url: createURL("extractIso&id=" + args.context.isos[0].id + "&zoneid=" + args.context.isos[0].zoneid + "&mode=HTTP_DOWNLOAD"),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      var jid = json.extractisoresponse.jobid;
                      args.response.success(
                        {_custom:
                         {jobId: jid,
                          getUpdatedItem: function(json) {
                            return json.queryasyncjobresultresponse.jobresult.iso;
                          },
                          getActionFilter: function() {
                            return isoActionfilter;
                          }
                         }
                        }
                      );
                    }
                  });
                },
                notification: {
                  poll: pollAsyncJobResult
                }
              },

              'delete': {
                label: 'Delete ISO',
                messages: {
                  confirm: function(args) {
                    return 'Are you sure you want to delete ISO ?';
                  },
                  success: function(args) {
                    return 'ISO is being deleted.';
                  },
                  notification: function(args) {
                    return 'Deleting ISO';
                  },
                  complete: function(args) {
                    return 'ISO has been deleted.';
                  }
                },
                action: function(args) {
                  var array1 = [];
                  if (args.context.isos[0].zoneid != null)
                    array1.push("&zoneid=" + args.context.isos[0].zoneid);

                  $.ajax({
                    url: createURL("deleteIso&id=" + args.context.isos[0].id + array1.join("")),
                    dataType: "json",
                    async: true,
                    success: function(json) {
                      var jid = json.deleteisosresponse.jobid;
                      args.response.success(
                        {_custom:
                         {jobId: jid,
                          getUpdatedItem: function(json) {
                            return {}; //nothing in this ISO needs to be updated, in fact, this whole ISO has being deleted
                          },
                          getActionFilter: function() {
                            return isoActionfilter;
                          }
                         }
                        }
                      );
                    }
                  });
                },
                notification: {
                  poll: pollAsyncJobResult
                }
              }

            },

            tabs: {
              details: {
                title: 'ISO Details',

                /*
                 preFilter: function(args) {
                 if(isAdmin()) {
                 args.$form.find('.form-item[rel=storage]').css('display', 'inline-block');
                 }
                 else {
                 args.$form.find('.form-item[rel=storage]').hide();
                 }
                 },
                 */

                fields: [
                  {
                    name: {
                      label: 'Name',
                      isEditable: true
                    }
                  },
                  {
                    id: { label: 'ID' },
                    zonename: { label: 'Zone name' },
                    zoneid: { label: 'Zone ID' },
                    displaytext: {
                      label: 'Description',
                      isEditable: true
                    },
                    isready: { label: 'Ready', converter:cloudStack.converters.toBooleanText },
                    status: { label: 'Status' },
                    size : {
                      label: 'Size',
                      converter: function(args) {
                        if (args == null || args == 0)
                          return "";
                        else
                          return cloudStack.converters.convertBytes(args);
                      }
                    },
                    isextractable: {
                      label: 'Extractable',
                       isBoolean: true,
                      isEditable: true,  
                      converter:cloudStack.converters.toBooleanText
                    },
                    bootable: {
                      label: 'Bootable',
                      converter:cloudStack.converters.toBooleanText
                    },
                    ispublic: {
                      label: 'Public',
                       isBoolean: true,
                      isEditable: true,  
                      converter:cloudStack.converters.toBooleanText
                    },
                    isfeatured: {
                      label: 'Featured',
                       isBoolean: true,
                      isEditable: true,  
                      converter:cloudStack.converters.toBooleanText
                    },
                    crossZones: {
                      label: 'Cross Zones',
                      converter:cloudStack.converters.toBooleanText
                    },

                    ostypeid: {
                      label: 'OS Type',
                      isEditable: true,
                      select: function(args) {
                        $.ajax({
                          url: createURL("listOsTypes"),
                          dataType: "json",
                          async: true,
                          success: function(json) {
                            var ostypes = json.listostypesresponse.ostype;
                            var items = [];
                            $(ostypes).each(function() {
                              items.push({id: this.id, description: this.description});
                            });
                            args.response.success({data: items});
                          }
                        });
                      }
                    },

                    domain: { label: 'Domain' },
                    account: { label: 'Account' },
                    created: { label: 'Created' }
                  }
                ],

                dataProvider: function(args) {
                  args.response.success(
                    {
                      actionFilter: isoActionfilter,
                      data:args.context.isos[0]
                    }
                  );
                }
              }
            }
          }
        }
      }
    }
  };

  var templateActionfilter = function(args) {
    var jsonObj = args.context.item;
    var allowedActions = [];   

    // "Edit Template", "Copy Template", "Create VM"
    if ((isAdmin() == false && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account))  //if neither root-admin, nor item owner
        || jsonObj.templatetype == "SYSTEM" || jsonObj.isready == false) {
      //do nothing
    }
    else {      
      allowedActions.push("edit");      
      allowedActions.push("copyTemplate");         
      //allowedActions.push("createVm"); // For Beta2, this simply doesn't work without a network.   
    }

    // "Download Template"
    if (((isAdmin() == false && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account)))  //if neither root-admin, nor item owner
        || (jsonObj.isready == false) || jsonObj.templatetype == "SYSTEM") {
      //do nothing
    }
    else {      
      allowedActions.push("downloadTemplate");
    }

    // "Delete Template"
    //if (((isUser() && jsonObj.ispublic == true && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account)))
    if (((isAdmin() == false && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account)))  //if neither root-admin, nor item owner
        || (jsonObj.isready == false && jsonObj.status != null && jsonObj.status.indexOf("Downloaded") != -1)        
        || (jsonObj.domainid ==	1 && jsonObj.account ==	"system")) {   
      //do nothing
    }
    else {      
      allowedActions.push("delete");
    }

    return allowedActions;
  }

  var isoActionfilter = function(args) {
    var jsonObj = args.context.item;
    var allowedActions = [];

    if ((isAdmin() == false && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account))  //if neither root-admin, nor item owner
        || (jsonObj.isready == false)
        || (jsonObj.domainid ==	1 && jsonObj.account ==	"system")
       ) {
         //do nothing
       }
    else {      
      allowedActions.push("edit");      
      allowedActions.push("copyISO");      
    }

    // "Create VM"
    // Commenting this out for Beta2 as it does not support the new network.
    /*
     //if (((isUser() && jsonObj.ispublic == true && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account))
     if (((isAdmin() == false && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account))  //if neither root-admin, nor item owner
     || jsonObj.isready == false)
     || (jsonObj.bootable == false)
     || (jsonObj.domainid ==	1 && jsonObj.account ==	"system")
     ) {
       //do nothing
     }
     else {     
       allowedActions.push("createVm");
     }
     */

    // "Download ISO"
    //if (((isUser() && jsonObj.ispublic == true && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account)))
    if (((isAdmin() == false && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account)))  //if neither root-admin, nor item owner
        || (jsonObj.isready == false)
        || (jsonObj.domainid ==	1 && jsonObj.account ==	"system")
       ) {
         //do nothing
       }
    else {      
      allowedActions.push("downloadISO");
    }

    // "Delete ISO"
    //if (((isUser() && jsonObj.ispublic == true && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account)))
    if (((isAdmin() == false && !(jsonObj.domainid == g_domainid && jsonObj.account == g_account)))  //if neither root-admin, nor item owner
        || (jsonObj.isready == false && jsonObj.status != null && jsonObj.status.indexOf("Downloaded") != -1)
        || (jsonObj.domainid ==	1 && jsonObj.account ==	"system")
       ) {
         //do nothing
       }
    else {     
      allowedActions.push("delete");
    }

    return allowedActions;
  }

})(cloudStack, testData);
