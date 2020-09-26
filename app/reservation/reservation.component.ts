import { Component, OnInit, Inject, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { TextField } from 'ui/text-field';
import { Switch } from 'ui/switch';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ReservationModalComponent } from "../reservationmodal/reservationmodal.component";
import * as app from "application";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { View } from "ui/core/view";
import { Page } from "ui/page";
import { AnimationCurve } from 'tns-core-modules/ui/enums';
import { CouchbaseService } from '../services/couchbase.service';

@Component({
    selector: 'app-reservation',
    moduleId: module.id,
    templateUrl: './reservation.component.html',
    styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {

    reservation: FormGroup;
    formComplete: boolean;
    formView: View;
    completeFormView: View;
    docId: string = "reservations";


    constructor(private formBuilder: FormBuilder, private modalService: ModalDialogService,
        private page: Page,
        private vcRef: ViewContainerRef,
        private couchbaseService: CouchbaseService) {
        this.formComplete = false;

        this.reservation = this.formBuilder.group({
            guests: 3,
            smoking: false,
            dateTime: ['', Validators.required]
        });
    }

    ngOnInit() {

    }
    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
    createModalView(args) {

        let options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            context: args,
            fullscreen: false
        };

        this.modalService.showModal(ReservationModalComponent, options)
            .then((result: any) => {
                if (args === "guest") {
                    this.reservation.patchValue({ guests: result });
                }
                else if (args === "date-time") {
                    this.reservation.patchValue({ dateTime: result });
                }
            });

    }
    onSmokingChecked(args) {
        let smokingSwitch = <Switch>args.object;
        if (smokingSwitch.checked) {
            this.reservation.patchValue({ smoking: true });
        }
        else {
            this.reservation.patchValue({ smoking: false });
        }
    }

    onGuestChange(args) {
        let textField = <TextField>args.object;

        this.reservation.patchValue({ guests: textField.text });
    }

    onDateTimeChange(args) {
        let textField = <TextField>args.object;

        this.reservation.patchValue({ dateTime: textField.text });
    }

    onSubmit() {

        this.formView = <View>this.page.getViewById<View>("viewForm");
        this.completeFormView = <View>this.page.getViewById<View>('viewCompleteForm');
        
        this.completeFormView.scaleX = 0;
        this.completeFormView.scaleY = 0;
        this.completeFormView.opacity = 0;

        this.formView.animate({
            duration: 500,
            scale: { x: 0, y: 0 },
            curve: AnimationCurve.easeInOut,
            opacity: 0
        }).then(() => {
            this.formComplete = true;
            //database
            this.saveReservation();

            this.completeFormView.animate({
                duration: 500,
                scale: { x: 1, y: 1 },
                curve: AnimationCurve.easeInOut,
                opacity: 1
            })
            // Reset animation

        });
        console.log(JSON.stringify(this.reservation.value));
    }

    private saveReservation() {
        let reservations: Array<any>;
        reservations = [];
        let doc = this.couchbaseService.getDocument(this.docId);
        if (doc == null) {
            this.couchbaseService.createDocument({ "reservations": [] }, this.docId);
        }
        else {
            reservations = doc.reservations;
        }
        reservations.push(this.reservation.value);
        this.couchbaseService.updateDocument(this.docId, { "reservations": reservations });
        console.log(reservations);
    }
}