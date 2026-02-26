#!/usr/bin/env python

import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
from torchvision.models import efficientnet_b4

from sklearn.model_selection import train_test_split
from torch.cuda.amp import autocast, GradScaler

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

BATCH_SIZE = 32
LR = 1e-4
EPOCHS = 20

DATA_DIR = "ml/Data/ISIC_2019_Processed"
MODEL_SAVE_PATH = "ml/models/best_model.pth"

transform = transforms.Compose([
    transforms.Resize((380,380)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(25),
    transforms.ColorJitter(0.2,0.2,0.15,0.05),
    transforms.RandomResizedCrop((380,380), scale=(0.9,1.1)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485,0.456,0.406],
        std=[0.229,0.224,0.225]
    )
])

dataset = datasets.ImageFolder(DATA_DIR, transform=transform)

labels = [label for _, label in dataset.samples]
indices = np.arange(len(dataset))

train_idx, temp_idx, y_train, y_temp = train_test_split(
    indices,
    labels,
    test_size=0.3,
    stratify=labels,
    random_state=42
)

val_idx, test_idx, _, _ = train_test_split(
    temp_idx,
    y_temp,
    test_size=0.5,
    stratify=y_temp,
    random_state=42
)

train_dataset = Subset(dataset, train_idx)
val_dataset = Subset(dataset, val_idx)
test_dataset = Subset(dataset, test_idx)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=6,
    pin_memory=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=4,
    pin_memory=True
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE
)

model = efficientnet_b4(weights="IMAGENET1K_V1")

for param in model.parameters():
    param.requires_grad = False

model.classifier[1] = nn.Linear(
    model.classifier[1].in_features,
    len(dataset.classes)
)

model = model.to(DEVICE)

criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=LR
)

scaler = GradScaler()

def train_one_epoch():
    model.train()

    total_loss = 0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images, labels = images.to(DEVICE), labels.to(DEVICE)

        optimizer.zero_grad()

        with autocast():
            outputs = model(images)
            loss = criterion(outputs, labels)

        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        total_loss += loss.item()

        _, preds = torch.max(outputs, 1)

        total += labels.size(0)
        correct += (preds == labels).sum().item()

    return total_loss / len(train_loader), correct / total


def validate():
    model.eval()

    total_loss = 0
    correct = 0
    total = 0

    with torch.no_grad():
        for images, labels in val_loader:

            images, labels = images.to(DEVICE), labels.to(DEVICE)

            with autocast():
                outputs = model(images)
                loss = criterion(outputs, labels)

            total_loss += loss.item()

            _, preds = torch.max(outputs, 1)

            total += labels.size(0)
            correct += (preds == labels).sum().item()

    return total_loss / len(val_loader), correct / total

best_val_acc = 0
patience = 5
patience_counter = 0

for epoch in range(EPOCHS):

    train_loss, train_acc = train_one_epoch()
    val_loss, val_acc = validate()

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        patience_counter = 0
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
    else:
        patience_counter += 1

    print(f"Epoch {epoch+1}")
    print(f"Train Loss {train_loss:.4f} | Train Acc {train_acc:.4f}")
    print(f"Val Loss {val_loss:.4f} | Val Acc {val_acc:.4f}")
    print("-"*40)

    if patience_counter >= patience:
        print("Early stopping triggered")
        break

print("Training complete.")