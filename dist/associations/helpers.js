'use strict';

function checkNamingCollision(association) {
  if (Object.prototype.hasOwnProperty.call(association.source.rawAttributes, association.as)) {
    throw new Error(`Naming collision between attribute '${association.as}'` + ` and association '${association.as}' on model ${association.source.name}` + '. To remedy this, change either foreignKey or as in your association definition');
  }
}

exports.checkNamingCollision = checkNamingCollision;

function addForeignKeyConstraints(newAttribute, source, target, options, key) {
  // FK constraints are opt-in: users must either set `foreignKeyConstraints`
  // on the association, or request an `onDelete` or `onUpdate` behavior
  if (options.foreignKeyConstraint || options.onDelete || options.onUpdate) {
    // Find primary keys: composite keys not supported with this approach
    const primaryKeys = Object.keys(source.primaryKeys).map(primaryKeyAttribute => source.rawAttributes[primaryKeyAttribute].field || primaryKeyAttribute);

    if (primaryKeys.length === 1 || !primaryKeys.includes(key)) {
      if (source._schema) {
        newAttribute.references = {
          model: source.sequelize.getQueryInterface().QueryGenerator.addSchema({
            tableName: source.tableName,
            _schema: source._schema,
            _schemaDelimiter: source._schemaDelimiter
          })
        };
      } else {
        newAttribute.references = {
          model: source.tableName
        };
      }

      newAttribute.references.key = key || primaryKeys[0];
      newAttribute.onDelete = options.onDelete;
      newAttribute.onUpdate = options.onUpdate;
    }
  }
}

exports.addForeignKeyConstraints = addForeignKeyConstraints;
/**
 * Mixin (inject) association methods to model prototype
 *
 * @private
 *
 * @param {Object} association instance
 * @param {Object} obj Model prototype
 * @param {Array} methods Method names to inject
 * @param {Object} aliases Mapping between model and association method names
 *
 */

function mixinMethods(association, obj, methods, aliases) {
  aliases = aliases || {};

  for (const method of methods) {
    // don't override custom methods
    if (!Object.prototype.hasOwnProperty.call(obj, association.accessors[method])) {
      const realMethod = aliases[method] || method;

      obj[association.accessors[method]] = function () {
        return association[realMethod](this, ...Array.from(arguments));
      };
    }
  }
}

exports.mixinMethods = mixinMethods;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9hc3NvY2lhdGlvbnMvaGVscGVycy5qcyJdLCJuYW1lcyI6WyJjaGVja05hbWluZ0NvbGxpc2lvbiIsImFzc29jaWF0aW9uIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwic291cmNlIiwicmF3QXR0cmlidXRlcyIsImFzIiwiRXJyb3IiLCJuYW1lIiwiZXhwb3J0cyIsImFkZEZvcmVpZ25LZXlDb25zdHJhaW50cyIsIm5ld0F0dHJpYnV0ZSIsInRhcmdldCIsIm9wdGlvbnMiLCJrZXkiLCJmb3JlaWduS2V5Q29uc3RyYWludCIsIm9uRGVsZXRlIiwib25VcGRhdGUiLCJwcmltYXJ5S2V5cyIsImtleXMiLCJtYXAiLCJwcmltYXJ5S2V5QXR0cmlidXRlIiwiZmllbGQiLCJsZW5ndGgiLCJpbmNsdWRlcyIsIl9zY2hlbWEiLCJyZWZlcmVuY2VzIiwibW9kZWwiLCJzZXF1ZWxpemUiLCJnZXRRdWVyeUludGVyZmFjZSIsIlF1ZXJ5R2VuZXJhdG9yIiwiYWRkU2NoZW1hIiwidGFibGVOYW1lIiwiX3NjaGVtYURlbGltaXRlciIsIm1peGluTWV0aG9kcyIsIm9iaiIsIm1ldGhvZHMiLCJhbGlhc2VzIiwibWV0aG9kIiwiYWNjZXNzb3JzIiwicmVhbE1ldGhvZCIsIkFycmF5IiwiZnJvbSIsImFyZ3VtZW50cyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsU0FBU0Esb0JBQVQsQ0FBOEJDLFdBQTlCLEVBQTJDO0FBQ3pDLE1BQUlDLE1BQU0sQ0FBQ0MsU0FBUCxDQUFpQkMsY0FBakIsQ0FBZ0NDLElBQWhDLENBQXFDSixXQUFXLENBQUNLLE1BQVosQ0FBbUJDLGFBQXhELEVBQXVFTixXQUFXLENBQUNPLEVBQW5GLENBQUosRUFBNEY7QUFDMUYsVUFBTSxJQUFJQyxLQUFKLENBQ0gsdUNBQXNDUixXQUFXLENBQUNPLEVBQUcsR0FBdEQsR0FDQyxxQkFBb0JQLFdBQVcsQ0FBQ08sRUFBRyxjQUFhUCxXQUFXLENBQUNLLE1BQVosQ0FBbUJJLElBQUssRUFEekUsR0FFQSxpRkFISSxDQUFOO0FBS0Q7QUFDRjs7QUFDREMsT0FBTyxDQUFDWCxvQkFBUixHQUErQkEsb0JBQS9COztBQUVBLFNBQVNZLHdCQUFULENBQWtDQyxZQUFsQyxFQUFnRFAsTUFBaEQsRUFBd0RRLE1BQXhELEVBQWdFQyxPQUFoRSxFQUF5RUMsR0FBekUsRUFBOEU7QUFDNUU7QUFDQTtBQUVBLE1BQUlELE9BQU8sQ0FBQ0Usb0JBQVIsSUFBZ0NGLE9BQU8sQ0FBQ0csUUFBeEMsSUFBb0RILE9BQU8sQ0FBQ0ksUUFBaEUsRUFBMEU7QUFDeEU7QUFDQSxVQUFNQyxXQUFXLEdBQUdsQixNQUFNLENBQUNtQixJQUFQLENBQVlmLE1BQU0sQ0FBQ2MsV0FBbkIsRUFDakJFLEdBRGlCLENBQ2JDLG1CQUFtQixJQUFJakIsTUFBTSxDQUFDQyxhQUFQLENBQXFCZ0IsbUJBQXJCLEVBQTBDQyxLQUExQyxJQUFtREQsbUJBRDdELENBQXBCOztBQUdBLFFBQUlILFdBQVcsQ0FBQ0ssTUFBWixLQUF1QixDQUF2QixJQUE0QixDQUFDTCxXQUFXLENBQUNNLFFBQVosQ0FBcUJWLEdBQXJCLENBQWpDLEVBQTREO0FBQzFELFVBQUlWLE1BQU0sQ0FBQ3FCLE9BQVgsRUFBb0I7QUFDbEJkLFFBQUFBLFlBQVksQ0FBQ2UsVUFBYixHQUEwQjtBQUN4QkMsVUFBQUEsS0FBSyxFQUFFdkIsTUFBTSxDQUFDd0IsU0FBUCxDQUFpQkMsaUJBQWpCLEdBQXFDQyxjQUFyQyxDQUFvREMsU0FBcEQsQ0FBOEQ7QUFDbkVDLFlBQUFBLFNBQVMsRUFBRTVCLE1BQU0sQ0FBQzRCLFNBRGlEO0FBRW5FUCxZQUFBQSxPQUFPLEVBQUVyQixNQUFNLENBQUNxQixPQUZtRDtBQUduRVEsWUFBQUEsZ0JBQWdCLEVBQUU3QixNQUFNLENBQUM2QjtBQUgwQyxXQUE5RDtBQURpQixTQUExQjtBQU9ELE9BUkQsTUFRTztBQUNMdEIsUUFBQUEsWUFBWSxDQUFDZSxVQUFiLEdBQTBCO0FBQUVDLFVBQUFBLEtBQUssRUFBRXZCLE1BQU0sQ0FBQzRCO0FBQWhCLFNBQTFCO0FBQ0Q7O0FBRURyQixNQUFBQSxZQUFZLENBQUNlLFVBQWIsQ0FBd0JaLEdBQXhCLEdBQThCQSxHQUFHLElBQUlJLFdBQVcsQ0FBQyxDQUFELENBQWhEO0FBQ0FQLE1BQUFBLFlBQVksQ0FBQ0ssUUFBYixHQUF3QkgsT0FBTyxDQUFDRyxRQUFoQztBQUNBTCxNQUFBQSxZQUFZLENBQUNNLFFBQWIsR0FBd0JKLE9BQU8sQ0FBQ0ksUUFBaEM7QUFDRDtBQUNGO0FBQ0Y7O0FBQ0RSLE9BQU8sQ0FBQ0Msd0JBQVIsR0FBbUNBLHdCQUFuQztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsU0FBU3dCLFlBQVQsQ0FBc0JuQyxXQUF0QixFQUFtQ29DLEdBQW5DLEVBQXdDQyxPQUF4QyxFQUFpREMsT0FBakQsRUFBMEQ7QUFDeERBLEVBQUFBLE9BQU8sR0FBR0EsT0FBTyxJQUFJLEVBQXJCOztBQUVBLE9BQUssTUFBTUMsTUFBWCxJQUFxQkYsT0FBckIsRUFBOEI7QUFDNUI7QUFDQSxRQUFJLENBQUNwQyxNQUFNLENBQUNDLFNBQVAsQ0FBaUJDLGNBQWpCLENBQWdDQyxJQUFoQyxDQUFxQ2dDLEdBQXJDLEVBQTBDcEMsV0FBVyxDQUFDd0MsU0FBWixDQUFzQkQsTUFBdEIsQ0FBMUMsQ0FBTCxFQUErRTtBQUM3RSxZQUFNRSxVQUFVLEdBQUdILE9BQU8sQ0FBQ0MsTUFBRCxDQUFQLElBQW1CQSxNQUF0Qzs7QUFFQUgsTUFBQUEsR0FBRyxDQUFDcEMsV0FBVyxDQUFDd0MsU0FBWixDQUFzQkQsTUFBdEIsQ0FBRCxDQUFILEdBQXFDLFlBQVc7QUFDOUMsZUFBT3ZDLFdBQVcsQ0FBQ3lDLFVBQUQsQ0FBWCxDQUF3QixJQUF4QixFQUE4QixHQUFHQyxLQUFLLENBQUNDLElBQU4sQ0FBV0MsU0FBWCxDQUFqQyxDQUFQO0FBQ0QsT0FGRDtBQUdEO0FBQ0Y7QUFDRjs7QUFDRGxDLE9BQU8sQ0FBQ3lCLFlBQVIsR0FBdUJBLFlBQXZCIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBjaGVja05hbWluZ0NvbGxpc2lvbihhc3NvY2lhdGlvbikge1xuICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGFzc29jaWF0aW9uLnNvdXJjZS5yYXdBdHRyaWJ1dGVzLCBhc3NvY2lhdGlvbi5hcykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgTmFtaW5nIGNvbGxpc2lvbiBiZXR3ZWVuIGF0dHJpYnV0ZSAnJHthc3NvY2lhdGlvbi5hc30nYCArXG4gICAgICBgIGFuZCBhc3NvY2lhdGlvbiAnJHthc3NvY2lhdGlvbi5hc30nIG9uIG1vZGVsICR7YXNzb2NpYXRpb24uc291cmNlLm5hbWV9YCArXG4gICAgICAnLiBUbyByZW1lZHkgdGhpcywgY2hhbmdlIGVpdGhlciBmb3JlaWduS2V5IG9yIGFzIGluIHlvdXIgYXNzb2NpYXRpb24gZGVmaW5pdGlvbidcbiAgICApO1xuICB9XG59XG5leHBvcnRzLmNoZWNrTmFtaW5nQ29sbGlzaW9uID0gY2hlY2tOYW1pbmdDb2xsaXNpb247XG5cbmZ1bmN0aW9uIGFkZEZvcmVpZ25LZXlDb25zdHJhaW50cyhuZXdBdHRyaWJ1dGUsIHNvdXJjZSwgdGFyZ2V0LCBvcHRpb25zLCBrZXkpIHtcbiAgLy8gRksgY29uc3RyYWludHMgYXJlIG9wdC1pbjogdXNlcnMgbXVzdCBlaXRoZXIgc2V0IGBmb3JlaWduS2V5Q29uc3RyYWludHNgXG4gIC8vIG9uIHRoZSBhc3NvY2lhdGlvbiwgb3IgcmVxdWVzdCBhbiBgb25EZWxldGVgIG9yIGBvblVwZGF0ZWAgYmVoYXZpb3JcblxuICBpZiAob3B0aW9ucy5mb3JlaWduS2V5Q29uc3RyYWludCB8fCBvcHRpb25zLm9uRGVsZXRlIHx8IG9wdGlvbnMub25VcGRhdGUpIHtcbiAgICAvLyBGaW5kIHByaW1hcnkga2V5czogY29tcG9zaXRlIGtleXMgbm90IHN1cHBvcnRlZCB3aXRoIHRoaXMgYXBwcm9hY2hcbiAgICBjb25zdCBwcmltYXJ5S2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZS5wcmltYXJ5S2V5cylcbiAgICAgIC5tYXAocHJpbWFyeUtleUF0dHJpYnV0ZSA9PiBzb3VyY2UucmF3QXR0cmlidXRlc1twcmltYXJ5S2V5QXR0cmlidXRlXS5maWVsZCB8fCBwcmltYXJ5S2V5QXR0cmlidXRlKTtcblxuICAgIGlmIChwcmltYXJ5S2V5cy5sZW5ndGggPT09IDEgfHwgIXByaW1hcnlLZXlzLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgIGlmIChzb3VyY2UuX3NjaGVtYSkge1xuICAgICAgICBuZXdBdHRyaWJ1dGUucmVmZXJlbmNlcyA9IHtcbiAgICAgICAgICBtb2RlbDogc291cmNlLnNlcXVlbGl6ZS5nZXRRdWVyeUludGVyZmFjZSgpLlF1ZXJ5R2VuZXJhdG9yLmFkZFNjaGVtYSh7XG4gICAgICAgICAgICB0YWJsZU5hbWU6IHNvdXJjZS50YWJsZU5hbWUsXG4gICAgICAgICAgICBfc2NoZW1hOiBzb3VyY2UuX3NjaGVtYSxcbiAgICAgICAgICAgIF9zY2hlbWFEZWxpbWl0ZXI6IHNvdXJjZS5fc2NoZW1hRGVsaW1pdGVyXG4gICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld0F0dHJpYnV0ZS5yZWZlcmVuY2VzID0geyBtb2RlbDogc291cmNlLnRhYmxlTmFtZSB9O1xuICAgICAgfVxuXG4gICAgICBuZXdBdHRyaWJ1dGUucmVmZXJlbmNlcy5rZXkgPSBrZXkgfHwgcHJpbWFyeUtleXNbMF07XG4gICAgICBuZXdBdHRyaWJ1dGUub25EZWxldGUgPSBvcHRpb25zLm9uRGVsZXRlO1xuICAgICAgbmV3QXR0cmlidXRlLm9uVXBkYXRlID0gb3B0aW9ucy5vblVwZGF0ZTtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydHMuYWRkRm9yZWlnbktleUNvbnN0cmFpbnRzID0gYWRkRm9yZWlnbktleUNvbnN0cmFpbnRzO1xuXG4vKipcbiAqIE1peGluIChpbmplY3QpIGFzc29jaWF0aW9uIG1ldGhvZHMgdG8gbW9kZWwgcHJvdG90eXBlXG4gKlxuICogQHByaXZhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYXNzb2NpYXRpb24gaW5zdGFuY2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogTW9kZWwgcHJvdG90eXBlXG4gKiBAcGFyYW0ge0FycmF5fSBtZXRob2RzIE1ldGhvZCBuYW1lcyB0byBpbmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBhbGlhc2VzIE1hcHBpbmcgYmV0d2VlbiBtb2RlbCBhbmQgYXNzb2NpYXRpb24gbWV0aG9kIG5hbWVzXG4gKlxuICovXG5mdW5jdGlvbiBtaXhpbk1ldGhvZHMoYXNzb2NpYXRpb24sIG9iaiwgbWV0aG9kcywgYWxpYXNlcykge1xuICBhbGlhc2VzID0gYWxpYXNlcyB8fCB7fTtcblxuICBmb3IgKGNvbnN0IG1ldGhvZCBvZiBtZXRob2RzKSB7XG4gICAgLy8gZG9uJ3Qgb3ZlcnJpZGUgY3VzdG9tIG1ldGhvZHNcbiAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGFzc29jaWF0aW9uLmFjY2Vzc29yc1ttZXRob2RdKSkge1xuICAgICAgY29uc3QgcmVhbE1ldGhvZCA9IGFsaWFzZXNbbWV0aG9kXSB8fCBtZXRob2Q7XG5cbiAgICAgIG9ialthc3NvY2lhdGlvbi5hY2Nlc3NvcnNbbWV0aG9kXV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGFzc29jaWF0aW9uW3JlYWxNZXRob2RdKHRoaXMsIC4uLkFycmF5LmZyb20oYXJndW1lbnRzKSk7XG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuZXhwb3J0cy5taXhpbk1ldGhvZHMgPSBtaXhpbk1ldGhvZHM7XG4iXX0=