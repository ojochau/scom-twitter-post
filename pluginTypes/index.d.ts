/// <reference path="@ijstech/components/index.d.ts" />
/// <amd-module name="@scom/scom-twitter-post/data.json.ts" />
declare module "@scom/scom-twitter-post/data.json.ts" {
    const _default: {
        defaultBuilderData: {
            url: string;
        };
    };
    export default _default;
}
/// <amd-module name="@scom/scom-twitter-post/model.ts" />
declare module "@scom/scom-twitter-post/model.ts" {
    import { IDataSchema, Module, Panel } from '@ijstech/components';
    import { callbackFnType, executeFnType } from '@scom/scom-blocknote-sdk';
    export interface ITweetConfig {
        conversation?: 'none';
        align?: 'center' | 'right';
        cards?: 'hidden';
        theme?: 'light' | 'dark';
    }
    export interface ITweetData {
        url: string;
        config?: ITweetConfig;
    }
    export class Model {
        private module;
        private moduleDir;
        private _data;
        updateWidget: () => void;
        createTwitterPost: (wrapper: Panel, url: string) => Module;
        constructor(module: Module);
        get url(): string;
        set url(value: string);
        get config(): ITweetConfig;
        set config(value: ITweetConfig);
        addBlock(blocknote: any, executeFn: executeFnType, callbackFn?: callbackFnType): {
            block: any;
            slashItem: {
                name: string;
                execute: (editor: any) => void;
                aliases: string[];
                group: string;
                icon: {
                    image: {
                        url: string;
                        width: string;
                        height: string;
                        display: string;
                    };
                };
                hint: string;
            };
            moduleData: {
                name: string;
                localPath: string;
            };
        };
        getConfigurators(): {
            name: string;
            target: string;
            getActions: () => {
                name: string;
                icon: string;
                command: (builder: any, userInputData: any) => {
                    execute: () => void;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: IDataSchema;
            }[];
            setData: any;
            getData: any;
            getTag: any;
            setTag: any;
        }[];
        private getPropertiesSchema;
        private _getActions;
        setData(value: ITweetData): Promise<void>;
        getData(): ITweetData;
        getTag(): any;
        setTag(value: any): void;
        private updateTag;
        private updateStyle;
        private updateTheme;
        getTweetID(url: string): string;
        loadLib(): void;
    }
}
/// <amd-module name="@scom/scom-twitter-post" />
declare module "@scom/scom-twitter-post" {
    import { ControlElement, Module, Container } from '@ijstech/components';
    import { BlockNoteSpecs, callbackFnType, executeFnType } from '@scom/scom-blocknote-sdk';
    import { ITweetConfig, ITweetData } from "@scom/scom-twitter-post/model.ts";
    interface ScomTwitterPostElement extends ControlElement {
        url: string;
        config?: ITweetConfig;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-twitter-post']: ScomTwitterPostElement;
            }
        }
    }
    export class ScomTwitterPost extends Module implements BlockNoteSpecs {
        private model;
        private pnlTwitterPost;
        private pnlLoading;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomTwitterPostElement, parent?: Container): Promise<ScomTwitterPost>;
        get url(): string;
        set url(value: string);
        get config(): ITweetConfig;
        set config(value: ITweetConfig);
        addBlock(blocknote: any, executeFn: executeFnType, callbackFn?: callbackFnType): {
            block: any;
            slashItem: {
                name: string;
                execute: (editor: any) => void;
                aliases: string[];
                group: string;
                icon: {
                    image: {
                        url: string;
                        width: string;
                        height: string;
                        display: string;
                    };
                };
                hint: string;
            };
            moduleData: {
                name: string;
                localPath: string;
            };
        };
        setData(data: ITweetData): Promise<void>;
        getData(): ITweetData;
        getTag(): any;
        setTag(value: any): Promise<void>;
        getConfigurators(): {
            name: string;
            target: string;
            getActions: () => {
                name: string;
                icon: string;
                command: (builder: any, userInputData: any) => {
                    execute: () => void;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: import("@ijstech/components").IDataSchema;
            }[];
            setData: any;
            getData: any;
            getTag: any;
            setTag: any;
        }[];
        clear(): void;
        private renderWidget;
        private createTwitterPost;
        private initModel;
        init(): Promise<void>;
        render(): any;
    }
}
