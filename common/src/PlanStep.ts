/* --------------------------------------------------------------------------------------------
 * Copyright (c) Jan Dolejsi. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

export class PlanStep {
    actionName: string;
    objects: string[];
    
    constructor(public time: number, public fullActionName: string, public duration: number) {
        let nameFragments = fullActionName.split(' ');
        this.actionName = nameFragments[0];
        this.objects = nameFragments.slice(1);
    }

    toPddl(): string {
        return `${this.time}: (${this.fullActionName}) [${this.duration}]`;
    }
}
