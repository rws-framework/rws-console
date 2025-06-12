import { Compiler, Compilation, NormalModule } from 'webpack';
import { ModuleCache } from './types';
import { ModuleResolver } from './ModuleResolver';
import { FilePatcher } from './FilePatcher';

/**
 * Webpack plugin that resolves nested dependencies and patches problematic modules
 */
export class CheckNestedModulesPlugin {
  private cache: ModuleCache = {
    resolvedModules: new Map<string, string>(),
    problematicModules: new Set<string>(),
    patchedFiles: new Set<string>()
  };
  
  private depsList: string[];
  private moduleResolver: ModuleResolver;
  private filePatcher: FilePatcher;

  /**
   * Creates a new instance of the CheckNestedModulesPlugin
   * @param depsList List of dependencies to track
   * @param problematicModules List of problematic modules to handle
   */
  constructor(
    depsList: string[] = [], 
    problematicModules: string[] = ['entities/decode', 'entities/escape']
  ) {
    // Convert the array to a Set for faster lookups
    this.cache.problematicModules = new Set(problematicModules);
    this.depsList = depsList;
    
    // Add base packages from problematicModules to the dependencies list
    const basePackages = new Set<string>();
    problematicModules.forEach(module => {
      const packageName = module.split('/')[0];
      basePackages.add(packageName);
    });
    
    // Add all base packages to depsList if they're not already there
    basePackages.forEach(pkg => {
      if (!this.depsList.includes(pkg)) {
        this.depsList.push(pkg);
      }
    });
    
    // Initialize helper classes
    this.moduleResolver = new ModuleResolver(this.cache, this.depsList);
    this.filePatcher = new FilePatcher(this.cache);
    
    console.log(`NestedDependencyResolverPlugin initialized with dependencies: ${this.depsList.join(', ')}`);
    console.log(`Problematic modules: ${Array.from(this.cache.problematicModules).join(', ')}`);
  }

  /**
   * Applies the plugin to the webpack compiler
   * @param compiler Webpack compiler instance
   */
  apply(compiler: Compiler) {
    // Hook into the resolver to intercept module resolution
    compiler.hooks.normalModuleFactory.tap('NestedDependencyResolverPlugin', (factory) => {
      // Intercept the module resolution process
      factory.hooks.beforeResolve.tap('NestedDependencyResolverPlugin', (resolveData) => {
        if (!resolveData || !resolveData.request) {
          return;
        }
        
        // Check if this is a dependency we want to track
        if (!this.depsList.some(dep => resolveData.request.includes(dep)) && 
            !this.cache.problematicModules.has(resolveData.request)) {
          return;
        }

        const issuer = resolveData.contextInfo.issuer || '';
        const nestedPath = this.moduleResolver.findNestedDependency(resolveData.request, issuer);
        
        if (nestedPath) {
          // Override the request with the nested module path
          resolveData.request = nestedPath;
          console.log(`Redirecting "${resolveData.request}" to nested dependency at "${nestedPath}"`);
        }
      });

      // Hook into the resolver plugin to handle module resolution
      const resolver = (compiler as any).resolverFactory.get('normal', {});
      if (resolver && resolver.hooks && resolver.hooks.resolve) {
        resolver.hooks.resolve.tapAsync('NestedDependencyResolverPlugin', 
          (request: { request?: string; context?: string }, 
           resolveContext: any, 
           callback: () => void) => {
          
          if (!request.request) {
            return callback();
          }

          // Check if this is a dependency we want to track
          const requestStr = request.request; // Now we know it's defined
          if (!this.depsList.some(dep => requestStr.includes(dep)) && 
              !this.cache.problematicModules.has(requestStr)) {
            return callback();
          }

          const context = typeof request.context === 'string' ? request.context : '';
          const nestedPath = this.moduleResolver.findNestedDependency(requestStr, context);
          
          if (nestedPath) {
            // Create a new request with the nested path
            const newRequest = { ...request, request: nestedPath };
            return resolver.doResolve(
              resolver.hooks.resolve,
              newRequest,
              `Resolved to nested dependency: ${nestedPath}`,
              resolveContext,
              callback
            );
          }

          return callback();
        });
      }
    });

    // Add hook to handle missing modules
    compiler.hooks.compilation.tap('NestedDependencyResolverPlugin', (compilation) => {
      // Intercept module errors
      compilation.hooks.failedModule.tap('NestedDependencyResolverPlugin', (module) => {
        if (module instanceof NormalModule) {
          const request = module.request;
          
          // Check if this is an error related to a problematic module
          for (const problematicModule of this.cache.problematicModules) {
            if (request.includes(problematicModule)) {
              const packageName = problematicModule.split('/')[0];
              console.warn(`Failed to resolve module: ${request}`);
              console.warn(`Try to add '${packageName}' to your dependencies and run npm install`);
              
              // Check if this is a parse5 module
              if (module.resource && module.resource.includes('parse5')) {
                console.warn(`This is a parse5 module. Trying to patch...`);
                this.filePatcher.checkAndPatchParse5(module);
              }
              
              break;
            }
          }
        }
      });

      // Add hook to patch modules before they're processed
      compilation.hooks.buildModule.tap('NestedDependencyResolverPlugin', (module) => {
        if (module instanceof NormalModule) {
          // Check if this is a parse5 module
          if (module.resource && module.resource.includes('parse5')) {
            this.filePatcher.checkAndPatchParse5(module);
          }
          
          // Check and patch hardcoded imports
          this.filePatcher.patchHardcodedImports(module);
        }
      });

      // Monitor loaded modules to detect nested dependencies
      compilation.hooks.succeedModule.tap('NestedDependencyResolverPlugin', (module) => {
        if (module instanceof NormalModule) {
          const request = module.request;
          const resource = module.resource;
          
          // Check if this is a module we're interested in
          if (this.depsList.some(dep => request.includes(dep))) {
            // Register nested dependencies for this module
            this.moduleResolver.registerNestedDependencies(resource, request);
          }
        }
      });
    });
    
    compiler.hooks.done.tap('NestedDependencyResolverPlugin', (stats) => {
      console.log(`NestedDependencyResolverPlugin resolved ${this.cache.resolvedModules.size} nested dependencies`);
      if (stats.hasErrors()) {
        const errors = stats.compilation.errors;
        
        // Check if there are errors related to problematic modules
        for (const problematicModule of this.cache.problematicModules) {
          const basePackage = problematicModule.split('/')[0];
          const moduleErrors = errors.filter(error => 
            error.message && error.message.includes(problematicModule));
          
          if (moduleErrors.length > 0) {
            console.warn(`Found ${moduleErrors.length} errors related to ${problematicModule}:`);
            moduleErrors.forEach(error => {
              console.warn(error.message);
            });
          }
        }
      }
    });
  }
}
